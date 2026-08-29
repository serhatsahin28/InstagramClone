const mongoose = require("../db");
const Schema = mongoose.Schema;

// Anasayfada "İlgilenmiyorum" denilen gönderiler; sadece o kullanıcının
// akışından gizlenir, gönderi kendisi silinmez.
const hiddenPost = new Schema({

    username: {
        type: String,
        require: true,
    },
    post_id: {
        type: String,
        require: true,
    }

});

hiddenPost.index({ username: 1, post_id: 1 }, { unique: true });

const hiddenPosts = mongoose.model("hiddenPost", hiddenPost, "hiddenPost");

module.exports = hiddenPosts;
