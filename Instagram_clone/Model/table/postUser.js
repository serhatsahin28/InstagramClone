
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://serhat:123@cluster0.e6a3vn3.mongodb.net/instagram").then(() => {
    console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});
const Schema = mongoose.Schema
const posts = new Schema({
    
    user_id: {
        type: String,
        require: true

    },
    description: {
        type: String,
        require: true

    },

    photos: [{
        "photo1": {
            type: String,
            require: true

        },
        "photo2": {
            type: String,
            require: true

        },
        "photo3": {
            type: String,
            require: true

        },
        "photo4": {
            type: String,
            require: true

        }
    }],
    username: {
        type: String,
        require: true

    },
    profilePhoto: {
        type: String,
        require: true

    },
})
const post = mongoose.model("posts", posts, "posts");

module.exports = post;