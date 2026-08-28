const mongoose = require("../db");
const Schema = mongoose.Schema;

const storyView = new Schema({
    story_id: {
        type: String,
        require: true
    },
    viewers: [{
        username: { type: String, require: true },
        userPicture: { type: String },
        userProfileName: { type: String },
        viewedAt: { type: Date, default: Date.now }
    }]
});

storyView.index({ story_id: 1 });

const model = mongoose.model("storyView", storyView, "storyView");

module.exports = model;
