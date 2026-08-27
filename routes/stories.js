const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { uploadProfile } = require("../middleware/upload");
const storyController = require("../Controller/storyController");

router.use(requireAuth);

router.get("/:username/:id", (req, res) => {
    const sessionUserName = req.session.user.username;
    const visitUsername = req.params.username;
    const visitId = req.params.id;

    const a = new storyController();
    a.story(req, res, sessionUserName, visitUsername, visitId);
});

router.post("/upload", uploadProfile.array("photos", 1), (req, res) => {
    const a = new storyController();
    const photos = req.files;
    const sessionUserName = req.session.user.username;
    a.uploadStory(req, res, photos, sessionUserName);
});

router.delete("/:id", (req, res) => {
    const user_id = req.body.storyId;
    const username = req.session.user.username;
    const a = new storyController();
    a.storyDelete(username, user_id);
    res.json({ message: "Story silindi" });
});

module.exports = router;
