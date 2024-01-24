const messageModel = require("../Model/table/dbMessages");
const user = require("../Model/table/dbUsers");

class messages {

    static async directInBox(sessionUsername) {
        try {
            const a = await messageModel.find({
                $or: [
                    { senderUser: sessionUsername },
                    { sentUsername: sessionUsername }
                ]
            });

            return a;


        }
        catch (err) {
            console.log("directInBox modeli directInBox fonks: " + err)
        }



    }


    static async directUserMessages(sessionUserName, userId) {


        try {
            console.log("sessionUserName degeri: " + sessionUserName);
            console.log("userId degeri: " + userId);
            const visitUser = await user.findOne({ _id: userId });
            console.log("visitUser degeri: " + visitUser);

            const visitUsername = visitUser.username;
            const messages = await messageModel.find({
                $or: [
                    { senderUser: visitUsername, sentUsername: sessionUserName },
                    { senderUser: sessionUserName, sentUsername: visitUsername }
                ]
            });

            return messages;



        }
        catch (err) {
            console.log("directInBox modeli directUserMessages fonks: " + err)
        }



    }

    static async messagesUser(userId) {


        try {
            const visitUser = await user.findOne({ _id: userId });


            return visitUser;

        }
        catch (err) {
            console.log("directInBox modeli messagesUser fonks: " + err)
        }



    }

    static async visitUser(visitedUsername) {


        try {
            const visitUser = await user.findOne({ username: visitedUsername });


            return visitUser;


        }
        catch (err) {
            console.log("directInBox modeli visitUser fonks: " + err)
        }



    }
    static async sessionUser(sessionUsername) {


        try {
            const visitUser = await user.findOne({ username: sessionUsername });

            return visitUser;


        }
        catch (err) {
            console.log("directInBox modeli sessionUser fonks: " + err)
        }



    }

    static async createNewMessage(sessionUserName, visitUser, sessionUser, newMessage) {


        try {
            const profilePicture = sessionUser.profilePicture;
            const sentUserId = visitUser._id;
            const sentUsername = visitUser.username;
            const sentUserImage = visitUser.profilePicture;
            const senderId = sessionUser._id;


            const a = await messageModel.create({
                "senderId": senderId,
                "senderUser": sessionUserName,
                "senderImage": profilePicture,
                "message": newMessage,
                "sentUserId": sentUserId,
                "sentUsername": sentUsername,
                "sentUserImage": sentUserImage
            }

            );


        }
        catch (err) {
            console.log("directInBox modeli createNewMessage fonks: " + err)
        }



    }




    static async fetchAllMessages(visitedUsername, sessionUserName) {


        try {
            // const visitUser = await user.findOne({ username: visitedUsername });
            const messages = await messageModel.find({
                $or: [
                    { senderUser: visitedUsername, sentUsername: sessionUserName },
                    { senderUser: sessionUserName, sentUsername: visitedUsername }
                ]
            });

            return messages;

        }
        catch (err) {
            console.log("directInBox modeli fetchAllMessages fonks: " + err)
        }



    }


}



module.exports = messages;