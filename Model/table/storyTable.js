const mongoose = require("../db");
const Schema = mongoose.Schema;
const stories = new Schema({

    user_id: {
        type: String,
        require: true

    },
    username: {
        type: String,
        require: true
    },
    profileName: {
        type: String,
        require: true

    },
    storie: {
        type: String,
        require: true
    },

    profilePicture: {

        type: String,
        require: true
    },
    isActive: {
        type: String,
        require: true

    }


});



const story = mongoose.model("stories", stories, "stories");


module.exports= story ;