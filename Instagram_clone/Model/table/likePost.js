const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI).then(() => {
    // console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});

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
