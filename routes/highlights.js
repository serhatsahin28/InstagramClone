const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const highlightController = require("../Controller/highlightController");

router.use(requireAuth);

router.get("/:username", (req, res) => {
    new highlightController().list(req, res, req.params.username);
});

router.post("/", (req, res) => {
    const sessionUserName = req.session.user.username;
    const { title, storyId } = req.body;
    new highlightController().addStory(req, res, sessionUserName, title, storyId);
});

router.delete("/:id", (req, res) => {
    const sessionUserName = req.session.user.username;
    new highlightController().remove(req, res, sessionUserName, req.params.id);
});

module.exports = router;
