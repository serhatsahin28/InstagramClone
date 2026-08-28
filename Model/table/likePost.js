const mongoose = require("../db");
const Schema = mongoose.Schema;



const likePost = new Schema({


    post_id: {
        type: String,
        require: true,
    },
    postOwnerUsername: {
        type: String,
        require: true,
    },

    userWhoLike: [
        {

            username: {
                type: String,
                require: true,
            }, userPicture: {
                type: String,
                require: true,
            }, userProfileName: {
                type: String,
                require: true,
            }


        }



    ]




});



// Sik kullanilan sorgu alanlari icin index; koleksiyon taramasini onler.
likePost.index({ post_id: 1 });
likePost.index({ postOwnerUsername: 1 });
likePost.index({ "userWhoLike.username": 1 });

const likes = mongoose.model("likePost", likePost, "likePost");


module.exports = likes;
