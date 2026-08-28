const express = require("express");
const router = express.Router();
const UserController = require("../Controller/UserController");

router.post("/login", (req, res) => {
    const { userName, password } = req.body;
    const userControllerInstance = new UserController();
    userControllerInstance.login(req, res, userName, password);
});

router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Oturum bulunamadı" });
    }
    const userControllerInstance = new UserController();
    userControllerInstance.me(req, res);
});

router.post("/logout", (req, res) => {
    const userControllerInstance = new UserController();
    userControllerInstance.logout(req, res);
});

router.post("/register", (req, res) => {
    const { email, userName, profileName, password, securityAnswer } = req.body;
    const userControllerInstance = new UserController();
    userControllerInstance.registerUserAdd(req, res, email, userName, profileName, password, securityAnswer);
});

router.post("/reset-password", (req, res) => {
    const { userName, securityAnswer, newPassword } = req.body;
    const userControllerInstance = new UserController();
    userControllerInstance.resetPassword(req, res, userName, securityAnswer, newPassword);
});

module.exports = router;
