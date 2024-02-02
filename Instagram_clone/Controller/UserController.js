const UserModel = require('../Model/userModel');
const postUser = require('../Model/postUser');

class UserController {
    // ...constructor ve diğer metodlar...

    async login(req, res, username, password) {
        try {
            const result = await UserModel.findUserByUsernameAndPassword(username, password);
            if (result !== null && result.length > 0) {

                const a = result[0].toObject();
                const profileName = a.profileName;
                const profilePicture = a.profilePicture;
                const description=a.description;

                req.session.user = { username, password, profileName, profilePicture,description };
                const userName = req.session.user.username;
                const stories = await UserModel.findAllStories(userName);
                const posts = await UserModel.findAllPosts();
                const followersTrue = await UserModel.findAllFollowersTrue(userName);
                const noticeFollow = await UserModel.findFollowSend(userName);
                // const allLikePostUser = await postUser.likePosts();
                const userLikePostUser = await postUser.userLikePosts(userName);
                const sessionProfilePicture = req.session.user.profilePicture;
                res.render("home", { userName, result, post: posts, stories, sessionProfilePicture, noticeFollow, followersTrue, userLikePostUser });
            } else {
                res.render("login");
            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Bir hata oluştu');
        }
    }
    logout(req, res) {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Hata oluştu');
                } else {
                    console.log('Oturum başarıyla sonlandırıldı');
                    res.render("login");
                }
            });
        } else {
            console.log('Zaten bir oturum yok');
            res.json({ message: 'Zaten bir oturum yok' });
        }
    }


    async privatePublicSettings(req,res,userName, isPrivate) {



        await UserModel.privateAccountControle(userName, isPrivate);
         res.redirect("/accounts/accountPrivateEdit");

    }


    async notificationSettings(req,res,userName,sessionProfilePicture) {



       const a= await UserModel.findSessionUser(userName);
        const isPrivate=a[0].isPrivate;
         res.render("notificationSetting",{userName,sessionProfilePicture,isPrivate});

    }


}

module.exports = UserController;
