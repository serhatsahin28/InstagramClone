const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(() => {
    // console.log("MongoDB'ye bağlanıldı");
}).catch((err) => {
    console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});


const Schema = mongoose.Schema;

const followSchema  = new Schema({
    userName: {
        type: String,
        required: true
    },
    userProfilePicture: {
        type: String,
        required: true
    },
    userProfileName: {
        type: String,
        require: true
    },
    followed: [
        {
            user_id: {
                type: String,
                required: true
            },

            username: {
                type: String,
                required: true
            },
            profileName: {
                type: String,
                required: true
            }, profilePicture: {
                type: String,
                required: true
            },
            situation: {
                type: Boolean,
                required: true

            }

        }


    ]





})

const follows = mongoose.model("follow", followSchema, "follow");

module.exports = follows;