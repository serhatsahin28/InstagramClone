const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const UserController = require("../Controller/UserController");
const Profile = require("../Controller/profileController");

router.use(requireAuth);

router.get("/settings", (req, res) => {
    const userName = req.session.user.username;
    const a = new UserController();
    a.settingEdit(req, res, userName);
});

router.post("/settings", (req, res) => {
    const userName = req.session.user.username;
    const a = new UserController();
    a.settingEdit(req, res, userName);
});

router.get("/privacy-setting", (req, res) => {
    const sessionProfilePicture = req.session.user.profilePicture;
    const userName = req.session.user.username;
    const a = new UserController();
    a.notificationSettings(req, res, userName, sessionProfilePicture, userName);
});

router.post("/privacy-setting", (req, res) => {
    const a = new UserController();
    const username = req.session.user.username;
    const isPrivate = req.body.name;
    a.privatePublicSettings(req, res, username, isPrivate);
});

router.delete("/me", (req, res) => {
    const userName = req.session.user.username;
    const a = new UserController();
    a.deleteAccount(req, res, userName, req.body.password);
});

router.post("/:username/block", (req, res) => {
    new Profile().blockUser(req, res, req.session.user.username, req.params.username);
});

router.delete("/:username/block", (req, res) => {
    new Profile().unblockUser(req, res, req.session.user.username, req.params.username);
});

router.get("/:username/followers", (req, res) => {
    new Profile().followList(req, res, req.params.username, "followers");
});

router.get("/:username/following", (req, res) => {
    new Profile().followList(req, res, req.params.username, "following");
});

router.get("/:username", (req, res) => {
    const a = new Profile();
    const username = req.params.username;
    const sessionUserName = req.session.user.username;
    const sessionProfileName = req.session.user.profileName;

    a.profile(req, res, username, sessionUserName, sessionProfileName);
});

module.exports = router;
