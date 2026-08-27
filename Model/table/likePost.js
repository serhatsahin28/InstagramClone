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



const likes = mongoose.model("likePost", likePost, "likePost");


module.exports = likes;
