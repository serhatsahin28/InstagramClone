const mongoose = require("mongoose");
const dotenv = require("dotenv");

// .env dosyasını yükle
dotenv.config();

// MongoDB bağlantısını kur
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
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
const users = mongoose.model("users", user, "users");

module.exports = users;