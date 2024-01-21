
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://serhat:123@cluster0.e6a3vn3.mongodb.net/instagram").then(() => {
    console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});
const Schema = mongoose.Schema
const posts = new Schema({
    description: {
        type: String,
        require: true

    },

    photos: [{
        "0": {
            type: String,
            require: true

        },
        "1": {
            type: String,
            require: true

        },
        "2": {
            type: String,
            require: true

        },
        "3": {
            type: String,
            require: true

        }
    }]

})
const post = mongoose.model("posts", posts, "posts");

module.exports = post;