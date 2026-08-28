const mongoose = require("../db");
const Schema = mongoose.Schema;



const comment = new Schema({


    post_id: {
        type: String,
        require: true,
    },
    postOwnerUsername: {
        type: String,
        require: true,
    },

    userWhoComment: [
        {

            username: {
                type: String,
                require: true,
            }, userPicture: {
                type: String,
                require: true,
            }, userComment: {
                type: String,
                require: true,
            }


        }



    ],

    // Bu yorumu begenen kullanicilar.
    likes: [
        {
            username: { type: String, required: true }
        }
    ],

    // Bir yanit ise, yanit verilen ust yorumun _id'si; ust seviye yorumlarda bos.
    parentId: {
        type: String
    }




});



// Sik kullanilan sorgu alanlari icin index; koleksiyon taramasini onler.
comment.index({ post_id: 1 });
comment.index({ postOwnerUsername: 1 });
comment.index({ "userWhoComment.username": 1 });

const comments = mongoose.model("comment", comment, "comment");


module.exports = comments;
