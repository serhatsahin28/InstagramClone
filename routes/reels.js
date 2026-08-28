const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { uploadReel } = require("../middleware/upload");
const reelController = require("../Controller/reelController");

router.use(requireAuth);

router.get("/", (req, res) => {
    new reelController().feed(req, res);
});

router.post("/upload", uploadReel.single("video"), (req, res) => {
    const sessionUserName = req.session.user.username;
    new reelController().upload(req, res, req.file, sessionUserName, req.body.description);
});

router.post("/:id/like", (req, res) => {
    const sessionUserName = req.session.user.username;
    new reelController().toggleLike(req, res, req.params.id, sessionUserName, true);
});

router.delete("/:id/like", (req, res) => {
    const sessionUserName = req.session.user.username;
    new reelController().toggleLike(req, res, req.params.id, sessionUserName, false);
});

router.delete("/:id", (req, res) => {
    const sessionUserName = req.session.user.username;
    new reelController().remove(req, res, req.params.id, sessionUserName);
});

module.exports = router;
