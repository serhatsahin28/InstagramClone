const mongoose = require("../db");
const Schema = mongoose.Schema;

const storyLike = new Schema({
    story_id: {
        type: String,
        require: true
    },
    userWhoLike: [{
        username: { type: String, require: true },
        userPicture: { type: String },
        userProfileName: { type: String }
    }]
});

storyLike.index({ story_id: 1 });
storyLike.index({ "userWhoLike.username": 1 });

const model = mongoose.model("storyLike", storyLike, "storyLike");

module.exports = model;
