const a = require("../Model/messageModel");
const messageTable = require("../Model/table/dbMessages");
const follow = require("../Model/table/follow");
const User = require("../Model/table/dbUsers");

function timeOf(id) {
    return id && id.getTimestamp ? id.getTimestamp().getTime() : 0;
}

// Oturum sahibinin karşılıklı yazıştığı her kullanıcı için tek bir konuşma özeti üretir.
async function buildInbox(sessionUserName) {
    // Iki sorgu birbirinden bagimsiz; tek turda calistirilir.
    const [all, followedDocs] = await Promise.all([
        a.directInBox(sessionUserName),
        follow.find({ userName: sessionUserName, "followed.situation": true })
    ]);

    const iFollow = new Set();
    for (const doc of followedDocs) {
        for (const f of doc.followed) {
            if (f.situation) iFollow.add(f.username);
        }
    }

    const threads = new Map();

    for (const msg of all) {
        const isSender = msg.senderUser === sessionUserName;
        const otherUsername = isSender ? msg.sentUsername : msg.senderUser;
        const otherUserId = isSender ? msg.sentUserId : msg.senderId;
        const otherUserImage = isSender ? msg.sentUserImage : msg.senderImage;
        const isUnread = !isSender && msg.read === false;

        const time = timeOf(msg._id);
        const existing = threads.get(otherUsername);

        if (!existing || time > existing.lastTime) {
            threads.set(otherUsername, {
                _id: String(msg._id),
                otherUsername,
                otherUserId,
                otherUserImage,
                lastMessage: msg.message,
                lastFromMe: isSender,
                lastTime: time,
                accepted: existing?.accepted || !!msg.accepted,
                hasIncoming: existing?.hasIncoming || !isSender,
                unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0)
            });
        } else {
            existing.accepted = existing.accepted || !!msg.accepted;
            existing.hasIncoming = existing.hasIncoming || !isSender;
            existing.unreadCount += isUnread ? 1 : 0;
        }
    }

    const list = Array.from(threads.values()).sort((x, y) => y.lastTime - x.lastTime);

    // Takip etmediğim ve henüz kabul etmediğim kişilerden gelenler "istek" sayılır.
    const inbox = [];
    const requests = [];
    for (const t of list) {
        const isRequest = !iFollow.has(t.otherUsername) && !t.accepted && t.hasIncoming;
        (isRequest ? requests : inbox).push(t);
    }

    const totalUnread = inbox.reduce((sum, t) => sum + t.unreadCount, 0);

    return { inbox, requests, totalUnread };
}

class messageController {

    async messageInbox(req, res, sessionUserName) {
        try {
            const { inbox, requests, totalUnread } = await buildInbox(sessionUserName);
            const profilePicture = req.session.user.profilePicture;

            res.json({ newDirectInbox: inbox, requests, totalUnread, sessionUserName, profilePicture });
        } catch (err) {
            console.log("messageInbox: " + err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    // Sadece rozet için: sayfayı açmadan okunmamış toplam mesaj sayısı.
    async unreadCount(req, res, sessionUserName) {
        try {
            const { totalUnread } = await buildInbox(sessionUserName);
            res.json({ totalUnread });
        } catch (err) {
            console.log("unreadCount: " + err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    async messageUser(req, res, sessionUserName, userId) {
        try {
            // Gelen kutusu ve karsi kullanici birbirini beklemez. Mesajlar
            // kullanici adina bagli oldugu icin tek adim sonra cekilir;
            // boylece ayni kullaniciyi iki kez sorgulamiyoruz.
            const [{ inbox, requests }, messagesUser] = await Promise.all([
                buildInbox(sessionUserName),
                a.messagesUser(userId)
            ]);

            const messagesInfo = await a.fetchAllMessages(messagesUser.username, sessionUserName);

            // Sohbeti açtı; karşıdan gelen mesajlar okunmuş sayılır.
            await a.markThreadRead(sessionUserName, messagesUser.username);

            const profilePicture = req.session.user.profilePicture;

            const otherUser = {
                otherUserId: messagesUser._id,
                otherUsername: messagesUser.username,
                otherUserImage: messagesUser.profilePicture
            };

            res.json({
                newDirectInbox: inbox,
                requests,
                sessionUserName,
                messagesInfo,
                messagesUser,
                sessionPicture: profilePicture,
                otherUser,
                profilePicture
            });
        } catch (err) {
            console.log("messageUser: " + err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    // Yeni mesaj başlatmak için seçilebilecek kullanıcılar: takip ettiklerim.
    async candidates(req, res, sessionUserName) {
        try {
            const docs = await follow.find({ userName: sessionUserName, "followed.situation": true });
            const usernames = [];
            for (const doc of docs) {
                for (const f of doc.followed) {
                    if (f.situation) usernames.push(f.username);
                }
            }

            const users = await User.find({ username: { $in: usernames } }, "username profileName profilePicture");
            res.json({ users });
        } catch (err) {
            console.log("candidates: " + err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    async acceptRequest(req, res, sessionUserName, otherUsername) {
        try {
            await messageTable.updateMany(
                {
                    $or: [
                        { senderUser: otherUsername, sentUsername: sessionUserName },
                        { senderUser: sessionUserName, sentUsername: otherUsername }
                    ]
                },
                { $set: { accepted: true } }
            );
            res.json({ message: "İstek kabul edildi" });
        } catch (err) {
            console.log("acceptRequest: " + err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    async deleteRequest(req, res, sessionUserName, otherUsername) {
        try {
            await messageTable.deleteMany({
                $or: [
                    { senderUser: otherUsername, sentUsername: sessionUserName },
                    { senderUser: sessionUserName, sentUsername: otherUsername }
                ]
            });
            res.json({ message: "İstek silindi" });
        } catch (err) {
            console.log("deleteRequest: " + err);
            res.status(500).json({ error: "Bir hata oluştu" });
        }
    }

    async messageSent(visitedUsername, sessionUserName, newMessage, sharedPostId) {
        const visitUser = await a.visitUser(visitedUsername);
        const sessionUser = await a.sessionUser(sessionUserName);

        return a.createNewMessage(sessionUserName, visitUser, sessionUser, newMessage, sharedPostId);
    }
}

module.exports = messageController;
