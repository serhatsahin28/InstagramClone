const UserModel = require('../Model/userModel');
const postUser = require('../Model/postUser');
const savedPost = require('../Model/table/savedPost');

class UserController {
    // ...constructor ve diğer metodlar...

    async buildFeed(req, username) {
        const result = await UserModel.findUserByUsername(username);
        const userName = req.session.user.username;
        const stories = await UserModel.findAllStories(userName);
        const sessionUserStories = await UserModel.findSessionStories(userName);

        const posts = await UserModel.findAllPosts();
        const followersTrue = await UserModel.findAllFollowersTrue(userName);
        const noticeFollow = await UserModel.findFollowSend(userName);
        const userLikePostUser = await postUser.userLikePosts(userName);
        const sessionProfilePicture = req.session.user.profilePicture;

        const savedDocs = await savedPost.find({ username: userName });
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

        if (userName != "" && profileName != "" && email != "" && password != "") {
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





}

module.exports = UserController;
