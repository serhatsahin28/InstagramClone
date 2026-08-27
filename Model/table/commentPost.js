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



    ]




});



const comments = mongoose.model("comment", comment, "comment");


module.exports = comments;
