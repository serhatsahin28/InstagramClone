const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const notificationController = require("../Controller/notificationController");

router.use(requireAuth);

router.get("/", (req, res) => {
    const a = new notificationController();
    a.list(req, res);
});

module.exports = router;
