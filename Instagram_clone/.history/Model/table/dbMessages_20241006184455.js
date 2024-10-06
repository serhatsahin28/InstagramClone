const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(() => {
    // console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});

const Schema = mongoose.Schema;

const message = new Schema({
    senderId: {
        type: String,
        require: true

    },
    senderUser: {
        type: String,
        require: true

    },
    senderImage: {
        type: String,
        require: true


    },
    message: {
        type: String,
        require: true

    },
    sentUserId: {
        type: String,
        require: true

    },
    sentUsername: {

        type: String,
        require: true

    },

    sentUserImage: {
        type: String,
        require: true

    }




});


const messages = mongoose.model("messages", message, "messages");
module.exports = messages;