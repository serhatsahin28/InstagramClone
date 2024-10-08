const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI).then(() => {
    // console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});


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
