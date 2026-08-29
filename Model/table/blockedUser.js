const mongoose = require("../db");
const Schema = mongoose.Schema;

// blockerUsername, blockedUsername'i engellemiştir.
const blockedUser = new Schema({

    blockerUsername: {
        type: String,
        require: true,
    },
    blockedUsername: {
        type: String,
        require: true,
    },
    blockedUserId: {
        type: String,
        require: true,
    }

});

blockedUser.index({ blockerUsername: 1, blockedUsername: 1 }, { unique: true });
blockedUser.index({ blockedUsername: 1 });

const blockedUsers = mongoose.model("blockedUser", blockedUser, "blockedUser");

module.exports = blockedUsers;
