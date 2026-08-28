const User = require("../Model/table/dbUsers");
const Post = require("../Model/table/postUser");
const follow = require("../Model/table/follow");
const story = require("../Model/table/storyTable");
const likePost = require("../Model/table/likePost");
const commentPost = require("../Model/table/commentPost");
const storyLike = require("../Model/table/storyLike");
const storyView = require("../Model/table/storyView");
const dbMessages = require("../Model/table/dbMessages");
const savedPost = require("../Model/table/savedPost");
const bcrypt = require("bcryptjs");


class UserModel {
    static async findUserByUsernameAndPassword(username, password) {
        try {
            const user = await User.findOne({ username: username });
            if (!user) return [];

            const looksHashed = /^\$2[aby]\$/.test(user.password);

            if (looksHashed) {
                const isMatch = await bcrypt.compare(password, user.password);
                return isMatch ? [user] : [];
            }

            // Eski kayıtlar düz metin şifreyle geldi; eşleşirse hash'e taşı.
            if (user.password === password) {
                user.password = await bcrypt.hash(password, 10);
                await user.save();
                return [user];
            }
            return [];
        } catch (err) {
            throw err;
        }
    }
    static async findUserByUsername(username) {
        try {
            const result = await User.find({ username: username });
            return result;
        } catch (err) {
            throw err;
        }
    }




    static async findPostByUser(username) {
        try {
            // En son yüklenen gönderi en üstte gösterilir.
            const post = await Post.find({ username: username }).sort({ _id: -1 });
            return post;
        } catch (err) {
            throw err;
        }
    }

    // Ana akis sadece takip edilen kullanicilarin (ve kendi) gonderilerini gosterir.
    static async findAllPosts(sessionUserName) {
        try {
            const followedDocs = await follow.find({
                "userName": sessionUserName,
                "followed.situation": true
            });

            const usernames = new Set([sessionUserName]);
            for (const doc of followedDocs) {
                for (const f of doc.followed) {
                    if (f.situation) usernames.add(f.username);
                }
            }

            const posts = await Post.find({ username: { $in: Array.from(usernames) } }).sort({ _id: -1 });
            return posts;
        } catch (err) {
            throw err;
        }
    }


    static async findAllFollowed(username, sessionUserName) {
        try {
            const posts = await follow.find({
                "userName": sessionUserName,
                "followed.username": username

            });
            return posts;
        } catch (err) {
            throw err;
        }
    }


    static async findAllFollowers(userName, sessionUserName) {
        try {

            const posts = await follow.find({
                "userName": userName,
                "followed.username": sessionUserName
            });
            return posts;
        } catch (err) {
            throw err;
        }
    }

    static async findAllFollowersTrue(sessionUserName) {
        try {
            const posts = await follow.find({
                "followed.username": sessionUserName,
                "followed.situation": true
            });

            return posts;
        } catch (err) {
            throw err;
        }
    }



    static async followSend(sessionUserName, otherUserId, sessionUserProfile, otherUserName, profileName, profilePicture, userSessionPicture, sessionProfileName) {
       
        // console.log("takip isteği atan bayern resim adı:"+userSessionPicture);
        // console.log("takip isteği atan bayern resim adı:"+profilePicture);
        try {


            const result = await follow.find({
                "userName": sessionUserName,
                "followed.username": otherUserName
            });
            if (result == null || result == "") {



                const addNewResult = await follow.create({

                    "userName": sessionUserName,
                    "userProfilePicture": userSessionPicture,
                    "userProfileName": sessionProfileName,
                    "followed": [{
                        "user_id": otherUserId,
                        "username": otherUserName,
                        "situation": true,
                        "profileName": profileName,
                        "profilePicture": profilePicture
                    }]

                });

            }

        }
        catch (err) {
            throw err;

        }

    }





    static async followRequest(sessionUserName, otherUserId, sessionUserProfile, otherUserName, profileName, profilePicture, userSessionPicture, sessionProfileName) {
        try {
            const result = await follow.find({
                "userName": sessionUserName,
                "followed.username": otherUserName
            });
            if (result == null || result == "") {


                const addNewResult = await follow.create({

                    "userName": sessionUserName,
                    "userProfilePicture": userSessionPicture,
                    "userProfileName": sessionProfileName,
                    "followed": [{
                        "user_id": otherUserId,
                        "username": otherUserName,
                        "situation": false,
                        "profileName": profileName,
                        "profilePicture": profilePicture
                    }]

                });

            }

        }
        catch (err) {
            throw err;

        }

    }











    static async unFollowed(profileName, sessionUserProfile) {

        try {

            const unfollow = await follow.deleteOne({

                "userName": sessionUserProfile,
                "followed.username": profileName

            });


        }
        catch (err) {
            console.log(err);
            throw err;

        }


    }



    static async findAllStories(userName) {

        try {
            const followed = await follow.find({
                "userName": userName,
                "followed.situation": true
            });

            const usernames = [];
            for (const doc of followed) {
                for (const f of doc.followed) {
                    if (f.situation) usernames.push(f.username);
                }
            }

            const stories = await story.find({
                "username": { $in: usernames }
            });
            return stories;

        }
        catch (err) {
            console.log(err);

        }

    }


    static async findSessionStories(userName) {

        try {


            const stories = await story.find({
                "username": userName
            });
            return stories;

        }
        catch (err) {
            console.log(err);

        }

    }




    static async findFollowSend(userName) {

        try {
// console.log("******-UserModal findFollowSend 248. satır giriş yapan ve takip edilen kullanıcı adı :"+userName);
            const a = await follow.find({
                "followed.username": userName,
                "followed.situation": false

            });

            // console.log("bu kullanıcıya takip isteği atan şahıslar:"+a);
            return a;




        } catch (error) {
            console.log("UserModel.js sayfası içerisinde findFolloSend Fonksiyonu içerisinde: " + error);
        }

    }

    static async findProfileFollowed(userName) {

        try {

            const a = await follow.find({
                "followed.username": userName,
                "followed.situation": true
            });

            const count = a.length;
            return count;




        } catch (error) {
            console.log("UserModel.js sayfası içerisinde findFolloSend Fonksiyonu içerisinde: " + error);
        }

    }


    static async findProfileFollowers(userName) {

        try {

            const a = await follow.find({
                "userName": userName,
                "followed.situation": true
            });

            const count = a.length;
            return count;




        } catch (error) {
            console.log("UserModel.js sayfası içerisinde findFolloSend Fonksiyonu içerisinde: " + error);
        }

    }




    static async findProfilePosts(userName) {

        try {

            const a = await Post.find({
                "username": userName,
            });

            const count = a.length;
            return count;




        } catch (error) {
            console.log("UserModel.js sayfası içerisinde findFolloSend Fonksiyonu içerisinde: " + error);
        }

    }



    static async privateAccountControle(username, isPrivate) {

        try {
            console.log(isPrivate);

            if (isPrivate == "true") {
                const a = await User.updateOne({
                    "username": username,
                },
                    { $set: { "isPrivate": false } }
                );
                return a;
            }
            else {
                const a = await User.updateOne({
                    "username": username,
                },
                    { $set: { "isPrivate": true } }
                );
                console.log("false fonk");

                return a;

            }





        } catch (error) {
            console.log("UserModel.js sayfası içerisinde findFolloSend Fonksiyonu içerisinde: " + error);
        }

    }


    static async findSessionUser(userName) {

        try {

            const a = await User.find({
                "username": userName,

            });

            return a;




        } catch (error) {
            console.log("UserModel.js sayfası içerisinde findFolloSend Fonksiyonu içerisinde: " + error);
        }

    }


    static async registerAddNewUser(email, userName, profileName, password, securityAnswer) {
        try {

            const hashedPassword = await bcrypt.hash(password, 10);
            // Buyuk/kucuk harf ve bosluk farki eslesmeyi bozmasin.
            const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

            const a = await User.create({
                "username": userName,
                "password": hashedPassword,
                "profilePicture": "newProfile.png",
                "description": "",
                "profileName": profileName,
                "isPrivate": false,
                "securityAnswerHash": securityAnswerHash

            });

            return a;

        } catch (error) {
            console.log("UserModel sayfası registerAddNewUser fonksiyonu: " + error);
            throw error;
        }

    }

    // Hesap silme: kullanicinin tum verileri (gonderiler, begeniler, yorumlar,
    // hikayeler, mesajlar, takip iliskileri, kayitlar) geri donusumsuz silinir.
    static async deleteAccount(userName, password) {
        const user = await User.findOne({ username: userName });
        if (!user) return { ok: false, error: "Kullanıcı bulunamadı" };

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) return { ok: false, error: "Şifre hatalı" };

        const myPosts = await Post.find({ username: userName }, "_id");
        const myPostIds = myPosts.map((p) => String(p._id));
        const myStories = await story.find({ username: userName }, "_id");
        const myStoryIds = myStories.map((s) => String(s._id));

        await Promise.all([
            Post.deleteMany({ username: userName }),
            likePost.deleteMany({ post_id: { $in: myPostIds } }),
            likePost.updateMany({}, { $pull: { userWhoLike: { username: userName } } }),
            commentPost.deleteMany({ post_id: { $in: myPostIds } }),
            commentPost.deleteMany({ "userWhoComment.username": userName }),
            story.deleteMany({ username: userName }),
            storyLike.deleteMany({ story_id: { $in: myStoryIds } }),
            storyLike.updateMany({}, { $pull: { userWhoLike: { username: userName } } }),
            storyView.deleteMany({ story_id: { $in: myStoryIds } }),
            storyView.updateMany({}, { $pull: { viewers: { username: userName } } }),
            follow.deleteOne({ userName: userName }),
            follow.updateMany({}, { $pull: { followed: { username: userName } } }),
            dbMessages.deleteMany({ $or: [{ senderUser: userName }, { sentUsername: userName }] }),
            savedPost.deleteMany({ username: userName }),
            User.deleteOne({ username: userName })
        ]);

        return { ok: true };
    }

    // Sifre sifirlama: guvenlik sorusu cevabi eslesirse yeni sifre kaydedilir.
    static async resetPassword(userName, securityAnswer, newPassword) {
        try {
            const user = await User.findOne({ username: userName });
            if (!user || !user.securityAnswerHash) return false;

            const matches = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswerHash);
            if (!matches) return false;

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            return true;
        } catch (error) {
            console.log("UserModel sayfası resetPassword fonksiyonu: " + error);
            throw error;
        }
    }


}

module.exports = UserModel;
