const mongoose = require("../db");
const Schema = mongoose.Schema;

const highlightSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    // Sirayla eklenen hikaye gorsel dosya adlari (storyTable.storie ile ayni format).
    stories: [
        {
            type: String
        }
    ]
}, { timestamps: true });

highlightSchema.index({ username: 1 });

const highlight = mongoose.model("highlight", highlightSchema, "highlight");

module.exports = highlight;
