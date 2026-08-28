const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { uploadPost, uploadProfile } = require("../middleware/upload");
const postController = require("../Controller/postController");
const libraryController = require("../Controller/libraryController");

router.use(requireAuth);

router.get("/explore", (req, res) => {
    new postController().explore(req, res);
});

router.get("/saved", (req, res) => {
    new libraryController().saved(req, res);
});

router.get("/liked", (req, res) => {
    new libraryController().liked(req, res);
});

router.get("/my-comments", (req, res) => {
    new libraryController().comments(req, res);
});

router.post("/:id/save", (req, res) => {
    new libraryController().toggleSave(req, res, req.params.id, true);
});

router.delete("/:id/save", (req, res) => {
    new libraryController().toggleSave(req, res, req.params.id, false);
});

router.get("/:id/likes", (req, res) => {
    new postController().getLikes(req, res, req.params.id);
});

router.get("/:id", (req, res) => {
    new postController().getOne(req, res, req.params.id);
});

router.post("/upload", uploadPost.array("photos", 4), (req, res) => {
    const a = new postController();
    const photos = req.files;
    const sessionUserName = req.session.user.username;
    a.uploadPhoto(req, res, photos, sessionUserName);
});

router.post("/profile-photo", uploadProfile.array("photos", 1), (req, res) => {
    const a = new postController();
    const photos = req.files;
    const sessionUserName = req.session.user.username;
    a.uploadProfilePhoto(req, res, photos, sessionUserName);
});

router.post("/profile-photo/settings", uploadProfile.array("photos", 1), (req, res) => {
    const a = new postController();
    let photos = "";
    if (req.files != "") {
        photos = req.files;
    }
    const sessionUserName = req.session.user.username;
    a.uploadProfileSettings(req, res, photos, sessionUserName);
});

module.exports = router;
