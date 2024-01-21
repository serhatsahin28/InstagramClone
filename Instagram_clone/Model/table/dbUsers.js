
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://REDACTED:REDACTED@REDACTED/instagram").then(() => {
    console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});
const Schema = mongoose.Schema
const user = new Schema({
    username: {
        type: String,
        require: true

    },

    password: {
        type: String,
        require: true

    }

})
const users = mongoose.model("users", user, "users");

module.exports = users;