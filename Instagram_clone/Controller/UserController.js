const UserModel = require('../Model/userModel');

class UserController {
    // ...constructor ve diğer metodlar...

    async login(req, res, username, password) {
        try {
            const result = await UserModel.findUserByUsernameAndPassword(username, password);
            if (result !== null && result.length > 0) {

                const a = result[0].toObject();
                const profileName = a.profileName;
                const profilePicture = a.profilePicture;

                req.session.user = { username, password, profileName,profilePicture };
                const userName = req.session.user.username;
                const stories = await UserModel.findAllStories(userName);
                const posts = await UserModel.findAllPosts();

                // console.log(stories);
                res.render("home", { userName, result, post: posts,stories});
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
}

module.exports = UserController;
