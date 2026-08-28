const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const messageController = require("../Controller/messageController");

router.use(requireAuth);

router.get("/inbox", (req, res) => {
    const a = new messageController();
    a.messageInbox(req, res, req.session.user.username);
});

router.get("/unread-count", (req, res) => {
    const a = new messageController();
    a.unreadCount(req, res, req.session.user.username);
});

router.get("/candidates", (req, res) => {
    const a = new messageController();
    a.candidates(req, res, req.session.user.username);
});

router.post("/requests/:username/accept", (req, res) => {
    const a = new messageController();
    a.acceptRequest(req, res, req.session.user.username, req.params.username);
});

router.delete("/requests/:username", (req, res) => {
    const a = new messageController();
    a.deleteRequest(req, res, req.session.user.username, req.params.username);
});

router.get("/:id", (req, res) => {
    const a = new messageController();
    a.messageUser(req, res, req.session.user.username, req.params.id);
});

module.exports = router;
