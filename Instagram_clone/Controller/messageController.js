const express = require("express");
const app = express();

const a = require("../Model/messageModel");

class messageController {


    async messageInbox(req, res, sessionUserName) {
        const directInbox = await a.directInBox(sessionUserName);
        const profilePicture = req.session.user.profilePicture;
        const uniqueUserMap = new Map();

        const newDirectInbox = directInbox.reduce((result, current) => {
            const key = [current.sentUsername, current.senderUser].sort().join('-');

            if (!uniqueUserMap.has(key)) {
                uniqueUserMap.set(key, true);

                result.push({
                    _id: current._id,
                    senderId: current.senderId,
                    senderUser: current.senderUser,
                    senderImage: current.senderImage,
                    sentUsername: current.sentUsername,
                    sentUserImage: current.sentUserImage,
                    sentUserId: current.sentUserId,
                });
            }
            return result;
        }, []);


        console.log("Mapped Direct messageInbox Inbox:", newDirectInbox);

        res.render("messages", { newDirectInbox, sessionUserName,profilePicture });
    }



    async messageUser(req, res, sessionUserName, userId) {

        try {
            const directInbox = await a.directInBox(sessionUserName);
            let messagesInfo = await a.directUserMessages(sessionUserName, userId);
            let messagesUser = await a.messagesUser(userId);
            console.log("messagesUser: " + messagesUser);
            // console.log(directInbox);
            const uniqueUserMap = new Map();
            const profilePicture = req.session.user.profilePicture;


            const newDirectInbox = directInbox.reduce((result, current) => {
                const key = [current.sentUsername, current.senderUser].sort().join('-');

                if (!uniqueUserMap.has(key)) {
                    uniqueUserMap.set(key, true);

                    result.push({
                        _id: current._id,
                        senderId: current.senderId,
                        senderUser: current.senderUser,
                        senderImage: current.senderImage,
                        sentUsername: current.sentUsername,
                        sentUserImage: current.sentUserImage,
                        sentUserId: current.sentUserId,
                    });
                }
                return result;
            }, []);


            const otherUser = {
                otherUserId: messagesUser._id,
                otherUsername: messagesUser.username,
                otherUserImage: messagesUser.profilePicture
            };






            const sessionPicture = req.session.user.profilePicture;
            res.render("messages", { newDirectInbox, sessionUserName, messagesInfo, messagesUser, sessionPicture, otherUser ,profilePicture});


        }
        catch (err) {

            console.log(err);
        }


    }





    async messageSent(visitedUsername, sessionUserName, newMessage) {
        const visitUser = await a.visitUser(visitedUsername);
        const sessionUser = await a.sessionUser(sessionUserName);
        const allMessages = await a.fetchAllMessages(sessionUserName, visitedUsername);

        const createNewMessage = await a.createNewMessage(sessionUserName, visitUser, sessionUser, newMessage);


    }












}


module.exports = messageController;