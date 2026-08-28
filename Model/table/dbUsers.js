const mongoose = require("../db");
const Schema = mongoose.Schema
const user = new Schema({

    username: {
        type: String,
        require: true

    },
    password: {
        type: String,
        require: true

    },
    profilePicture: {
        type: String,
        require: true

    },
    description: {
        type: String,
        require: true

    },
    profileName: {
        type: String,
        require: true

    },
    isPrivate: {
        type: Boolean,
        require: true
    }

})
// Sik kullanilan sorgu alanlari icin index; koleksiyon taramasini onler.
user.index({ username: 1 });

const users = mongoose.model("users", user, "users");

module.exports = users;