const commentPost = require("../Model/table/commentPost");
const likePost = require("../Model/table/likePost");
const post = require("../Model/table/postUser");
const followPost = require("../Model/table/follow");
const User = require("../Model/table/dbUsers");
const Profile = require("../Controller/profileController");
const messageController = require("../Controller/messageController");
const postController = require("../Controller/postController");
const noticeController = require("../Controller/noticeController");

module.exports = function registerSocket(io) {
    const changeStream = followPost.watch();

    // Baglanti basina degil, bir kez kaydedilir; aksi halde her yeni socket
    // bu stream'e ayri bir dinleyici ekliyor ve hicbiri temizlenmiyordu
    // (EventEmitter memory leak - "MaxListenersExceededWarning").
    changeStream.on("change", (change) => {
        let notification;
        if (change.operationType === "update") {
            notification = `Bir kullanıcı güncellendi: ${change.documentKey._id}`;
        } else if (change.operationType === "delete") {
            notification = `Bir kullanıcı silindi: ${change.documentKey._id}`;
        }

        if (notification) {
            io.emit("followNotification", change);
        }
    });

    io.on("connection", (socket) => {
        console.log("Kullanıcı bağlandı:", socket.id);

        // Her kullanıcı kendi adıyla bir odaya katılır; bildirimler sadece o odaya gider.
        socket.on("register", (username) => {
            if (username) socket.join(username);
        });

        function notify(targetUsername, payload) {
            if (!targetUsername) return;
            io.to(targetUsername).emit("notify", payload);
        }

        socket.on("disconnect", () => {
            console.log("Bir kullanıcı ayrıldı");
        });

        socket.on("messageFromClient", (data) => {
            const userName = data.userSessionName;
            const a = new Profile();
            a.followProfile(userName, data);

            notify(data.username, {
                type: "follower",
                username: userName,
                profilePicture: data.userSessionPicture
            });
        });

        socket.on("sentFollow", (data) => {
            const userName = data.userSessionName;
            const a = new Profile();
            a.followRequest(userName, data);

            notify(data.username, {
                type: "follow_request",
                username: userName,
                profilePicture: data.userSessionPicture
            });
        });

        socket.on("unfollow", (formData) => {
            const userName = formData.userSessionName;
            const a = new Profile();
            a.unfollowProfile(userName, formData);

            // Sadece ilgili iki kullanıcıya bildir; herkese yayınlama.
            const IsFollowed = undefined;
            io.to(userName).to(formData.profileName).emit("unFollow", {
                IsFollowed,
                follower: userName,
                followed: formData.profileName
            });
        });

        socket.on("submitForm", (formData) => {
            const visitedUsername = formData.username;
            const sessionUserName = formData.sessionUserName;
            const newMessage = formData.message;
            const a = new messageController();
            a.messageSent(visitedUsername, sessionUserName, newMessage, formData.sharedPostId);

            io.emit("submitForm2", formData);
        });

        socket.on("searchUser", async (searchTerm) => {
            try {
                const users = await User.find({
                    username: {
                        $regex: new RegExp(searchTerm.formUser, "i"),
                        $ne: searchTerm.sessionUserName
                    }
                });

                io.emit("searchUser2", users);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("acceptFollow", (data) => {
            const a = new noticeController();
            a.acceptFollow(data);
        });

        socket.on("deleteFollow", (data) => {
            const a = new noticeController();
            a.deleteFollow(data);
        });

        socket.on("like", async (data) => {
            const a = new postController();
            a.likePhoto(data);

            try {
                const found = await post.find({ _id: data.imgId });
                const owner = found[0]?.username;
                if (owner && owner !== data.sessionUserName) {
                    const liker = await User.findOne({ username: data.sessionUserName });
                    notify(owner, {
                        type: "like",
                        username: data.sessionUserName,
                        profilePicture: liker?.profilePicture
                    });
                }
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("unlike", (data) => {
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

        socket.on("deletePost", async (data) => {
            try {
                const a = new postController();
                const result = await a.postDelete(data);
                if (result?.ok) {
                    io.emit("returnDeletePost", { sessionName: data.sessionUserName, postId: data.imgId });
                }
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("commentPost", async ({ data, sessionUserName }) => {
            try {
                const post_id = data.imgId;
                const query = await commentPost.find({ post_id: post_id }).sort({ _id: -1 });
                const postInfo = await post.find({ _id: post_id });

                const IslikedSession = await likePost.find({ post_id: post_id, "userWhoLike.username": sessionUserName });
                let IslikedSession2 = "";

                if (IslikedSession != null && IslikedSession != "") {
                    IslikedSession2 = "/Icons/redHeart.png";
                } else {
                    IslikedSession2 = "/Icons/heart.png";
                }

                io.emit("commentPostReturn", { query, IslikedSession2, IslikedSession, post_id, postInfo });
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

                await commentPost.create({
                    post_id: post_id,
                    postOwnerUsername: usernamePostOwner,
                    userWhoComment: [
                        {
                            username: sessionUserName,
                            userPicture: sessionUserPicture,
                            userComment: newComment
                        }
                    ]
                });

                const newQuery = await commentPost.find({ post_id: post_id }).sort({ _id: -1 });

                io.emit("commentPostReturn2", newQuery);

                if (usernamePostOwner && usernamePostOwner !== sessionUserName) {
                    notify(usernamePostOwner, {
                        type: "comment",
                        username: sessionUserName,
                        profilePicture: sessionUserPicture,
                        comment: newComment
                    });
                }
            } catch (error) {
                console.error(error);
            }
        });

        // Yorumu sadece yazan kisi ya da gonderi sahibi silebilir.
        socket.on("commentDelete", async ({ commentId, sessionUserName }) => {
            try {
                const target = await commentPost.findById(commentId);
                if (!target) return;

                const author = target.userWhoComment?.[0]?.username;
                const isAuthor = author === sessionUserName;
                const isPostOwner = target.postOwnerUsername === sessionUserName;
                if (!isAuthor && !isPostOwner) return;

                await commentPost.deleteOne({ _id: commentId });
                const newQuery = await commentPost.find({ post_id: target.post_id }).sort({ _id: -1 });
                io.emit("commentPostReturn2", newQuery);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("follower", async (sessionUserName) => {
            const usersInfo = await followPost.find({ "followed.username": sessionUserName, "followed.situation": true });
            io.emit("followerReturn", usersInfo);
        });

        socket.on("followed", async (sessionUserName) => {
            const query = await followPost.find({ userName: sessionUserName, "followed.situation": true });
            io.emit("followedReturn", query);
        });

        socket.on("notificationLive", async (sessionUserName) => {
            const query = await followPost.find({ "followed.username": sessionUserName });

            if (query != null) {
                io.emit("notificationLiveReturn", query);
            }
        });

        socket.on("buttonClickedFollow", (data) => {
            io.emit("ClickedFollow", data);
        });
    });
};
