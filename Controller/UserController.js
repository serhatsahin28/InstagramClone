const UserModel = require('../Model/userModel');
const postUser = require('../Model/postUser');
const savedPost = require('../Model/table/savedPost');
const { sendResetCodeEmail } = require('../Model/mailer');

class UserController {
    // ...constructor ve diğer metodlar...

    async buildFeed(req, username) {
        const userName = req.session.user.username;

        // Sorgular birbirinden bagimsiz; sirayla beklemek yerine tek turda
        // calistirilir (8 gidis-donus yerine 1).
        const [
            result,
            stories,
            sessionUserStories,
            posts,
            followersTrue,
            noticeFollow,
            userLikePostUser,
            savedDocs
        ] = await Promise.all([
            UserModel.findUserByUsername(username),
            UserModel.findAllStories(userName),
            UserModel.findSessionStories(userName),
            UserModel.findAllPosts(userName),
            UserModel.findAllFollowersTrue(userName),
            UserModel.findFollowSend(userName),
            postUser.userLikePosts(userName),
            savedPost.find({ username: userName })
        ]);

        const sessionProfilePicture = req.session.user.profilePicture;
        const savedPostIds = savedDocs.map((d) => String(d.post_id));

        return { userName, result, post: posts, stories, sessionProfilePicture, noticeFollow, followersTrue, userLikePostUser, sessionUserStories, savedPostIds };
    }

    async login(req, res, username, password) {
        try {
            const result = await UserModel.findUserByUsernameAndPassword(username, password);
            if (result !== null && result.length > 0) {

                const a = result[0].toObject();
                const profileName = a.profileName;
                const profilePicture = a.profilePicture;
                const description = a.description;

                req.session.user = { username, profileName, profilePicture, description };

                const feed = await this.buildFeed(req, username);
                res.json(feed);
            } else {
                res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    async me(req, res) {
        try {
            const feed = await this.buildFeed(req, req.session.user.username);
            res.json(feed);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }
    logout(req, res) {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: "Hata oluştu" });
                } else {
                    res.json({ message: "Oturum başarıyla sonlandırıldı" });
                }
            });
        } else {
            res.json({ message: 'Zaten bir oturum yok' });
        }
    }


    async privatePublicSettings(req, res, userName, isPrivate) {

        await UserModel.privateAccountControle(userName, isPrivate);
        res.json({ message: "Güncellendi" });

    }



    async settingEdit(req, res, userName) {

        const a = await UserModel.findSessionUser(userName);

        const sessionProfilePicture = a[0].profilePicture;
        const profileName = a[0].profileName;
        const description = a[0].description;

        res.json({ sessionProfilePicture, userName, profileName, description });


    }




    async notificationSettings(req, res, userName, sessionProfilePicture) {

        const a = await UserModel.findSessionUser(userName);
        const isPrivate = a[0].isPrivate;
        res.json({ userName, sessionProfilePicture, isPrivate });

    }


    async registerUserAdd(req, res, email, userName, profileName, password) {

        // Onceden "!= \"\"" ile kontrol ediliyordu; alan hic gonderilmediginde
        // (undefined) bu kontrol yanlislikla gecerdi ve kullanilamaz "hayalet"
        // hesaplar olusuyordu. Artik gercek bir dolu-string kontrolu yapiliyor.
        const isFilled = (v) => typeof v === "string" && v.trim() !== "";
        if ([userName, profileName, email, password].every(isFilled)) {
            try {
                await UserModel.registerAddNewUser(email, userName, profileName, password);
                res.json({ message: "Kayıt başarılı" });
            } catch (err) {
                res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
            }
        }
        else {
            res.status(400).json({ error: "Tüm alanlar zorunludur" });
        }

    }

    // Hesabi ve tum verilerini geri donusumsuz siler; sifre onayi gerektirir.
    async deleteAccount(req, res, userName, password) {
        if (typeof password !== "string" || password.trim() === "") {
            return res.status(400).json({ error: "Şifreni girmelisin" });
        }

        try {
            const result = await UserModel.deleteAccount(userName, password);
            if (!result.ok) return res.status(400).json({ error: result.error });

            req.session.destroy(() => {
                res.json({ message: "Hesabın silindi" });
            });
        } catch (err) {
            console.log("UserController deleteAccount: " + err);
            res.status(500).json({ error: "Hesap silinemedi" });
        }
    }

    // Adim 1: kullanicinin e-postasina 6 haneli kod gonderilir. Hesabin var
    // olup olmadigini sizdirmamak icin her zaman ayni genel mesaj donulur.
    async requestPasswordReset(req, res, userName) {
        if (typeof userName !== "string" || userName.trim() === "") {
            return res.status(400).json({ error: "Kullanıcı adını girmelisin" });
        }

        try {
            const result = await UserModel.requestPasswordReset(userName.trim());
            if (result) {
                await sendResetCodeEmail(result.email, result.code).catch((err) => {
                    console.log("requestPasswordReset mail gonderim hatasi: " + err);
                });
            }
            // Hesap yoksa veya e-postasi kayitli degilse de ayni mesaj donulur.
            res.json({ message: "Hesabınla ilişkili bir e-posta varsa, sıfırlama kodu gönderildi." });
        } catch (err) {
            console.log("UserController requestPasswordReset: " + err);
            res.status(500).json({ error: "İstek gönderilemedi" });
        }
    }

    // Adim 2: kod dogruysa (ve suresi gecmediyse) yeni sifre kaydedilir.
    async resetPassword(req, res, userName, code, newPassword) {
        const isFilled = (v) => typeof v === "string" && v.trim() !== "";
        if (![userName, code, newPassword].every(isFilled)) {
            return res.status(400).json({ error: "Tüm alanlar zorunludur" });
        }

        try {
            const ok = await UserModel.resetPassword(userName, code.trim(), newPassword);
            if (!ok) return res.status(400).json({ error: "Kod hatalı veya süresi dolmuş" });
            res.json({ message: "Şifren güncellendi" });
        } catch (err) {
            res.status(500).json({ error: "Şifre sıfırlanamadı" });
        }
    }





}

module.exports = UserController;
