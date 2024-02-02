const User = require("../Model/table/dbUsers");
const Post = require("../Model/table/postUser");
const follow = require("../Model/table/follow");
const story = require("../Model/table/storyTable");


class UserModel {
    static async findUserByUsernameAndPassword(username, password) {
        try {
            const result = await User.find({ username: username, password: password });
            return result;
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
            const post = await Post.find({ username: username });
            return post;
        } catch (err) {
            throw err;
        }
    }

    static async findAllPosts() {
        try {
            const posts = await Post.find({});
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

    static async findAllFollowersTrue(userName) {
        try {

            const posts = await follow.find({
                "followed.username": userName,
                "followed.situation": true
            });
            return posts;
        } catch (err) {
            throw err;
        }
    }



    static async followSend(sessionUserName, otherUserId, sessionUserProfile, otherUserName, profileName, profilePicture, userSessionPicture, sessionProfileName) {
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
            const user = followed.map(item => item.followed[0].username);


            const stories = await story.find({
                "username": user
            });
            return stories;

        }
        catch (err) {
            console.log(err);

        }




    }
    static async findFollowSend(userName) {

        try {

            const a = await follow.find({
                "followed.username": userName,
                "followed.situation": false

            });

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


}

module.exports = UserModel;
