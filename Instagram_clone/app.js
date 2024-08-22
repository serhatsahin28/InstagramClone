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
const multer = require('multer')

app.set('views', path.join(__dirname, 'View'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("images"));//Define the img folder

app.use(express.static("scss"));

//tables
const User = require("./Model/table/dbUsers");
const commentPost = require("./Model/table/commentPost");
const likePost = require("./Model/table/likePost");
const postUser = require("./Model/table/postUser");
const post = require("./Model/table/postUser");

//controllers
const followPost = require("./Model/table/follow");
const UserController = require("./Controller/UserController");
const Profile = require("./Controller/profileController");
const storyController = require("./Controller/storyController");
const messageController = require("./Controller/messageController");
const postController = require("./Controller/postController");
const noticeController = require("./Controller/noticeController");

const { log } = require("console");
const { acceptFollow } = require("./Model/postUser");
app.set('view engine', 'ejs');
app.use(session({
    secret: 'a',
    resave: false,
    saveUninitialized: false
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/posts'); // Dosyaların nereye kaydedileceğini belirtin
    },
    filename: function (req, file, cb) {
        // Dosyanın adını belirleyin
        // Örneğin, her dosyanın orijinal adı yerine farklı bir adlandırma yapabilirsiniz
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/users_profile'); // Dosyaların nereye kaydedileceğini belirtin
    },
    filename: function (req, file, cb) {
        // Dosyanın adını belirleyin
        // Örneğin, her dosyanın orijinal adı yerine farklı bir adlandırma yapabilirsiniz
        cb(null, file.originalname);
    }
});

const upload2 = multer({ storage: storage2 });





// MongoDB Change Stream
const changeStream = followPost.watch();





io.on("connection", (socket) => {
    console.log("Kullanıcı bağlandı:", socket.id);

    changeStream.on('change', (change) => {
        let notification;
        if (change.operationType === 'insert') {
            // console.log("INSERT");
            notification = `Yeni bir kullanıcı eklendi: ${change.fullDocument.name}`;
        } else if (change.operationType === 'update') {
            // console.log("update");
    
            notification = `Bir kullanıcı güncellendi: ${change.documentKey._id}`;
        } else if (change.operationType === 'delete') {
            // console.log("delete");
    
            notification = `Bir kullanıcı silindi: ${change.documentKey._id}`;
        }
    
        if (notification) {
            io.emit('followNotification', change);
            // console.log("Bildirim var(followNotification)...");
        }
    });
    
    

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

    socket.on("sentFollow", (data) => {

        //  console.log(data);
        const userName = data.userSessionName;
        const a = new Profile();
        a.followRequest(userName, data);


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

    socket.on('searchUser', async (searchTerm) => {
        try {
            // MongoDB'den kullanıcıları bul
            const users = await User.find({
                username: {
                    $regex: new RegExp(searchTerm.formUser, 'i'), // Arama terimine uygun olanları bul
                    $ne: searchTerm.sessionUserName // sessionUserName'a eşit olmayanları al
                }
            });

            io.emit("searchUser2", users);


            // Bulunan kullanıcıları istemciye gönder
        } catch (error) {
            console.error(error);
        }
    });



    socket.on("acceptFollow", (data) => {
        // console.log("acceptFollow: "+data.userName);
        const a = new noticeController();
        a.acceptFollow(data);
    });

    socket.on("deleteFollow", (data) => {
        const a = new noticeController();
        // console.log("data app.js sayfası: "+data.userName);
        a.deleteFollow(data);
    });



    socket.on("like", (data) => {
        const a = new postController();
        a.likePhoto(data);

    });


    socket.on("unlike", (data) => {
        console.log("app.js sayfası" + data);


        const a = new postController();
        a.deleteLikePhoto(data);

    });


    socket.on("likeSee", async (data) => {
        try {
            const a = await likePost.find({ post_id: data });
            io.emit("likeSeeReturn", a);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on("deletePost", (data) => {
        try {
            const sessionName = data.sessionUserName;
            const a = new postController();
            a.postDelete(data);
            io.emit("returnDeletePost", sessionName);

        } catch (error) {

        }
    });


    socket.on("commentPost", async ({ data, sessionUserName }) => {

        try {
            const post_id = data.imgId;
            const query = await commentPost.find({ "post_id": post_id }).sort({ _id: -1 });
            const IslikedSession = await likePost.find({ post_id: post_id, "userWhoLike.username": sessionUserName });
            let IslikedSession2 = "";
             console.log("aaa:"+post_id);

            if (IslikedSession != null && IslikedSession != "") {
                IslikedSession2 = "/Icons/redHeart.png";

            }
            else {
                IslikedSession2 = "/Icons/heart.png";

            }


            io.emit("commentPostReturn", { query, IslikedSession2,IslikedSession,post_id });


        } catch (error) {
            console.error(error);
        }
    });

    socket.on("commentMessageAdd", async (newCommentData) => {

        try {
            const post_id = newCommentData.imgId;
            const sessionUserName = newCommentData.sessionUserName;
            const newComment = newCommentData.newComment;
            const usernamePostOwner = newCommentData.usernamePostOwner;
            const sessionUserPicture = newCommentData.sessionUserPicture;


            const queryAddNewComment = await commentPost.create({
                "post_id": post_id,
                "postOwnerUsername": usernamePostOwner,
                userWhoComment: [
                    {
                        "username": sessionUserName,
                        "userPicture": sessionUserPicture,
                        "userComment": newComment,

                    }
                ]

            });

            const newQuery = await commentPost.find({ "post_id": post_id }).sort({ _id: -1 });




            io.emit("commentPostReturn2", newQuery);
        } catch (error) {
            console.error(error);
        }
    });


    socket.on("follower", async (sessionUserName) => {

        const query = await followPost.find({ "followed.username": sessionUserName, "followed.situation": true });
        io.emit("followerReturn", query);

    });


    socket.on("followed", async (sessionUserName) => {
        const query = await followPost.find({ "userName": sessionUserName, "followed.situation": true });
        io.emit("followedReturn", query);

    });

    socket.on("notificationLive", async (sessionUserName) => {
         const query = await followPost.find({"followed.username": sessionUserName });
      
        if (query != null) {
            io.emit("notificationLiveReturn", query);

        }

    });

    socket.on('buttonClickedFollow', (data) => {
        console.log('Button clicked:', data);

        // Diğer tüm kullanıcılara veya belirli bir odaya mesaj gönder
        io.emit('ClickedFollow', data); // b.ejs'teki fonksiyonu tetikle
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



app.get("/logout", (req, res) => {
    const userControllerInstance = new UserController();
    userControllerInstance.logout(req, res); // UserController'ın login metodunu çağırıyoruz
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


app.post("/upload/", upload.array('photos', 4), (req, res) => {
    console.log("upload fonksiyonunda");
    const a = new postController();
    const photos = req.files;
    const sessionUserName = req.session.user.username;

    a.uploadPhoto(req, res, photos, sessionUserName);
});
app.post("/profilePhoto/", upload2.array('photos', 1), (req, res) => {
    console.log("profilePhoto fonksiyonunda");
    const a = new postController();
    const photos = req.files;
    const sessionUserName = req.session.user.username;

    a.uploadProfilePhoto(req, res, photos, sessionUserName);
});
app.post("/storyUpload/", upload2.array('photos', 1), (req, res) => {
    console.log("storyUpload fonksiyonunda");
    const a = new storyController();
    const photos = req.files;
    const sessionUserName = req.session.user.username;

    a.uploadStory(req, res, photos, sessionUserName);
});



app.post("/profilePhoto/setting/", upload2.array('photos', 1), (req, res) => {
    console.log("setting profilePhoto fonksiyonunda");

    const a = new postController();
    let photos = "";
    if (req.files != "") {
        photos = req.files;
    }
    else {
        photos = "";
    }

    const sessionUserName = req.session.user.username;

    a.uploadProfileSettings(req, res, photos, sessionUserName);
});



app.get("/accounts/edit/", (req, res) => {
    const userName = req.session.user.username;
    const a = new UserController();
    a.settingEdit(req, res, userName);

});

app.get("/accounts/themeSetting/", (req, res) => {
    const sessionProfilePicture = req.session.user.profilePicture;
    const userName = req.session.user.username;
    const profileName = req.session.user.profileName;
    const description = req.session.user.description;
    // console.log("sessionProfilePicture"+req.session.user.profilePicture);
     res.render("themeSetting", { sessionProfilePicture, userName, profileName, description });

});

app.post("/accounts/edit/", (req, res) => {
    const sessionProfilePicture = req.session.user.profilePicture;
    const userName = req.session.user.username;
    const profileName = req.session.user.profileName;
    const description = req.session.user.description;
    console.log(description);
    res.render("settings", { sessionProfilePicture, userName, profileName, description });


});


app.get("/accounts/accountPrivateEdit/", (req, res) => {
    const sessionProfilePicture = req.session.user.profilePicture;
    const userName = req.session.user.username;
    const a = new UserController();
    a.notificationSettings(req, res, userName, sessionProfilePicture, userName);



});

app.post("/accounts/PrivatePublicEditProfile/", (req, res) => {
    const a = new UserController();
    const username = req.session.user.username;
    let isPrivate = req.body.name;
    a.privatePublicSettings(req, res, username, isPrivate);


});

app.post("/delete/story/:id/", (req, res) => {
    const user_id = req.body.storyId;
    const username = req.session.user.username;
    const a = new storyController();
    a.storyDelete(username, user_id)
    res.redirect("/");


});

app.get("/accounts/emailsignup/", (req, res) => {

    res.render("register");


});
app.post("/accounts/registerAdd/", (req, res) => {

    const email = req.body.email;
    const userName = req.body.userName;
    const profileName = req.body.profileName;
    const password = req.body.password;

    const a = new UserController();
    a.registerUserAdd(req,res,email,userName,profileName,password);

});


server.listen(PORT, () => {
    console.log("port dinleniyor");
    
});

