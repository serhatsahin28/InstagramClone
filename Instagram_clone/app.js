const express = require("express");
const app = express();
const http = require('http');
const PORT = 3000;
const session = require("express-session");
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);
app.set('views', path.join(__dirname, 'View'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("images"));//Define the img folder

app.use(express.static("scss"));
const UserController = require("./Controller/UserController");
const Profile = require("./Controller/profileController");
const User = require("./Model/table/dbUsers");
const storyController = require("./Controller/storyController");
const messageController = require("./Controller/messageController");

const { log } = require("console");
app.set('view engine', 'ejs');
app.use(session({
    secret: 'a',
    resave: false,
    saveUninitialized: false
}));




io.on("connection", (socket) => {
    console.log("Kullanıcı bağlandı:", socket.id);


    // Client'tan gelen 'disconnect' event'ini dinle
    socket.on('disconnect', () => {
        console.log('Bir kullanıcı ayrıldı');
    });
    // Bu satırı ekleyerek bağlantının başarıyla gerçekleştiğini loglayabilirsiniz.
    console.log('Socket.IO ile bağlantı kuruldu');



    socket.on("messageFromClient", (data) => {

        //  console.log(data);
        const userName = data.userSessionName;
        const a = new Profile();
        a.followProfile(userName, data);
        // const IsFollowed = "false";
        // io.emit("aaa", { IsFollowed });

    });


    socket.on("unfollow", (formData) => {

        const userName = formData.userSessionName;
        const a = new Profile();
        a.unfollowProfile(userName, formData);
        const IsFollowed = undefined;
        io.emit("unFollow", { IsFollowed });

    });

    socket.on("submitForm", (formData) => {
        const visitedUsername = formData.username;
        const sessionUserName = formData.sessionUserName;
        const newMessage = formData.message;
        const profilePicture = formData.profilePicture;
        const a = new messageController();
        a.messageSent(visitedUsername, sessionUserName, newMessage)

       
        io.emit("submitForm2", formData);

    });





});


app.get('/', (req, res) => {
    if (req.session.user == null) {
        res.render("login");
    }
    else {

        const userName = req.session.user.username;
        const password = req.session.user.password;

        const userControllerInstance = new UserController();
        userControllerInstance.login(req, res, userName, password);

    }
});



app.post("/logout", (req, res) => {
    const userControllerInstance = new UserController();
    userControllerInstance.logout(req, res); // UserController'ın login metodunu çağırıyoruz
});





app.post('/control', (req, res) => {
    const { userName, password } = req.body;
    const userControllerInstance = new UserController();
    userControllerInstance.login(req, res, userName, password);

});


app.get("/:name", (req, res) => {


    const a = new Profile();
    const username = req.params.name;
    const sessionUserName = req.session.user.username;
    const sessionProfileName = req.session.user.profileName;

    a.profile(req, res, username, sessionUserName, sessionProfileName);


});





app.post("/follow/user", (req, res) => {

    const userId = req.body._id;
    const userName = req.body.username;
    const user_profile_name = req.body.userProfileName;
    const user_picture = req.body.userProfilePicture;
    const newFollowerData = {
        userId,
        userName,
        user_profile_name,
        user_picture,
        situation: false
    };
    const sessionUser = req.session.user.username;


    const a = new Profile();
    a.reqFollow(sessionUser, userId, userName, user_profile_name, user_picture);




});









app.get("/stories/:username/:id", (req, res) => {
    const sessionUserName = req.session.user.username;
    const visitUsername = req.params.username;
    const visitId = req.params.id;


    const a = new storyController();
    a.story(req, res, sessionUserName, visitUsername, visitId);

});




app.get("/direct/inbox", (req, res) => {
    const a = new messageController();
    const sessionUserName = req.session.user.username;
    const b = a.messageInbox(req, res, sessionUserName);
});


app.get("/direct/:id/", (req, res) => {
    const a = new messageController();
    const userId = req.params.id;
    const sessionUserName = req.session.user.username;
    const b = a.messageUser(req, res, sessionUserName, userId);
});






server.listen(PORT, () => {//App yerine burada server kullanmamız gerekiyor.(Socket.io çalışması için)
    console.log("port dinleniyor");
});



