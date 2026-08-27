const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Profile = require("../Controller/profileController");

router.use(requireAuth);

router.post("/request", (req, res) => {
    const userId = req.body._id;
    const userName = req.body.username;
    const user_profile_name = req.body.userProfileName;
    const user_picture = req.body.userProfilePicture;
    const sessionUser = req.session.user.username;

    const a = new Profile();
    a.reqFollow(req, res, sessionUser, userId, userName, user_profile_name, user_picture);
});

module.exports = router;
