const mongoose = require("../db");
const Schema = mongoose.Schema;

const reelSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
});

reelSchema.index({ username: 1 });

const reel = mongoose.model("reel", reelSchema, "reel");

module.exports = reel;
