const mongoose = require("../db");
const Schema = mongoose.Schema;

const savedPost = new Schema({
    username: {
        type: String,
        require: true
    },
    post_id: {
        type: String,
        require: true
    }
});

const saved = mongoose.model("savedPost", savedPost, "savedPost");

module.exports = saved;
