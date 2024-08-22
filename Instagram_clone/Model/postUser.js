const User = require("../Model/table/dbUsers");
const Post = require("../Model/table/postUser");
const follow = require("../Model/table/follow");
const story = require("../Model/table/storyTable");
const likePost = require("../Model/table/likePost");
const commentPost = require("../Model/table/commentPost");


class postUser {

    static async userInfo(sessionUserName) {

        try {
            const a = User.findOne({ username: sessionUserName });
            return a;
        } catch (error) {
            console.log("postUserjs model sayfası userInfo fonksiyonu: " + error);
        }

    }

    static async postAdd(sessionUserName, user_id, profilePhoto, photo1, photo2, photo3, photo4, textArea) {
        try {
            // console.log("sessionUserName:" + sessionUserName);
            // console.log("user_id:" + user_id);
            // console.log("profilePhoto:" + profilePhoto);
            // console.log("photo1:" + photo1);
            // console.log("photo2:" + photo2);
            // console.log("photo3:" + photo3);
            // console.log("photo4:" + photo4);
            // console.log("textArea:" + textArea);


            photo1 = photo1 ? photo1 : "";
            photo2 = photo2 ? photo2 : "";
            photo3 = photo3 ? photo3 : "";
            photo4 = photo4 ? photo4 : "";


            const a = await Post.create({
                user_id: user_id,
                description: textArea,
                photos: [
                    {
                        photo1: photo1,
                        photo2: photo2,
                        photo3: photo3,
                        photo4: photo4
                    }
                ],
                username: sessionUserName,
                profilePhoto: profilePhoto


            });



        } catch (error) {
            console.log("postUserjs model sayfası postAdd fonksiyonu: " + error);
        }


    }


    static async acceptFollow(userName, profileName) {
        try {
            // console.log("parentDivId: " + userName);
            // console.log("profileName: " + profileName);

            const a = await follow.updateOne(
                { "userName": profileName, "followed.username": userName },

                { $set: { "followed.$.situation": true } }
            );



        } catch (error) {
            console.log("Model/postUser page acceptFollow function: " + error);
        }

    }

    static async deleteFollow(userName,profileName) {
        try {
            console.log("deleteFollow userName: "+userName);
            console.log("deleteFollow profileName: "+profileName);

            const a = await follow.deleteOne(
                { "userName": profileName, "followed.username": userName },

            );



        } catch (error) {
            console.log("Model/postUser page deleteFollow function: " + error);
        }

    }


    static async likePosts() {
        try {
            const a = await likePost.find();

            return a;


        } catch (error) {
            console.log("Model/postUser page likePosts function: " + error);
        }

    }





    static async userLikePosts(userName) {
        try {
            const a = await likePost.find({ "userWhoLike.username": userName });

            return a;


        } catch (error) {
            console.log("Model/postUser page userLikePosts function: " + error);
        }

    }




    static async likeNewPost(data) {
        try {
            const sessionUserName = data.sessionUserName;
            const postId = data.imgId;

            const a = await Post.find({ "_id": postId });
            const postOwnerUsername = a[0].username;
            const user = await User.find({ username: sessionUserName });
            const profilePicture = user[0].profilePicture;
            const profileName = user[0].profileName;

let findNewPost=await likePost.find({
    "post_id": postId,
    "postOwnerUsername": postOwnerUsername,
    "userWhoLike.username": sessionUserName,
            "userWhoLike.userPicture": profilePicture,
          "userWhoLike.userProfileName": profileName
    
    
});

console.log("postUser likeNewPost fonksiyonu findNewPost değeri: "+findNewPost);

if(findNewPost==""){
    // console.log("postUser likeNewPost fonksiyonu findNewPost değeri if değeri içerisi");
    const createLikePost = await likePost.create({
        post_id: postId,
        postOwnerUsername: postOwnerUsername,
        userWhoLike: [
            {
                username: sessionUserName,
                userPicture: profilePicture,
                userProfileName: profileName
            }
        ]

    });

}

        



        } catch (error) {
            console.log("Model/postUser page likeNewPosts function: " + error);
        }

    }



    static async deleteLikePost(data) {
        try {
            const sessionUserName = data.sessionUserName;
            const postId = data.imgId;

            const a = await Post.find({ "_id": postId });
            const postOwnerUsername = a[0].username;
            const user = await User.find({ username: sessionUserName });
            const profilePicture = user[0].profilePicture;
            const profileName = user[0].profileName;

            const deletePost = await likePost.deleteOne({
                post_id: postId,
                "userWhoLike.username": sessionUserName

            });





        } catch (error) {
            console.log("Model/postUser page deleteLikePost function: " + error);
        }

    }



static async deletePost(postId){

try {
    console.log("postUser.js sayfasında deletePost fonksiyonu içerisinde ");
    console.log(postId);
const a=await Post.deleteOne({
"_id":postId
});

const b=await likePost.deleteMany({
    "post_id":postId
    });

    const c=await commentPost.deleteMany({
        "post_id":postId
        });



} catch (error) {
    console.log("postUser.js sayfasında deletePost fonksiyonu içerisinde: "+error);
    
}


};






    static async updateProfilePhoto(sessionUserName, profilePicture) {
        try {

            const a = await User.updateOne(
                { "username": sessionUserName },

                { $set: { "profilePicture": profilePicture } }
            );



        } catch (error) {
            console.log("Model/postUser page updateProfilePhoto function: " + error);
        }

    }


    static async updateProfileSetting(sessionUserName, profilePicture, textArea) {
        try {

            if (profilePicture == "" && textArea != "") {
                const a = await User.updateOne(
                    { "username": sessionUserName },
                    { $set: { "description": textArea } }

                );
                console.log("textArea değerde boş değil");

                return a;

            }

            else if (textArea == "" && profilePicture != "") {

                const a = await User.updateOne(
                    { "username": sessionUserName },
                    { $set: { "profilePicture": profilePicture } }

                );
                console.log("profilePicture değerde boş değil");

                return a;

            }

            else if (textArea != "" && profilePicture != "") {
                const a = await User.updateOne(
                    { "username": sessionUserName },

                    { $set: { "profilePicture": profilePicture, "description": textArea } }
                );
                console.log("İki değerde tekrar boş değil ve  ekleme yapıldı");
            
                return a;

            }

            else {
                const a = "boş değer";
                console.log("İki değerde boş");

            }


        } catch (error) {
            console.log("Model/postUser page updateProfilePhoto function: " + error);
        }

    }






}


module.exports = postUser;