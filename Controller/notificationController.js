const follow = require("../Model/table/follow");
const likePost = require("../Model/table/likePost");
const commentPost = require("../Model/table/commentPost");

function timeOf(id) {
    return id && id.getTimestamp ? id.getTimestamp().getTime() : 0;
}

class notificationController {

    async list(req, res) {
        try {
            const me = req.session.user.username;

            // Uc sorgu birbirinden bagimsiz; tek turda calistirilir.
            const [followDocs, likes, comments] = await Promise.all([
                follow.find({ "followed.username": me }),
                likePost.find({ postOwnerUsername: me }),
                commentPost.find({ postOwnerUsername: me })
            ]);

            const items = [];

            for (const doc of followDocs) {
                const entry = doc.followed.find((f) => f.username === me);
                if (!entry) continue;
                if (doc.userName === me) continue;

                items.push({
                    id: String(doc._id),
                    type: entry.situation ? "follower" : "follow_request",
                    username: doc.userName,
                    profilePicture: doc.userProfilePicture,
                    profileName: doc.userProfileName,
                    time: timeOf(doc._id)
                });
            }

            for (const doc of likes) {
                for (const liker of doc.userWhoLike) {
                    if (liker.username === me) continue;
                    items.push({
                        id: String(doc._id) + "-" + liker.username,
                        type: "like",
                        username: liker.username,
                        profilePicture: liker.userPicture,
                        post_id: doc.post_id,
                        time: timeOf(doc._id)
                    });
                }
            }

            for (const doc of comments) {
                for (const c of doc.userWhoComment) {
                    if (c.username === me) continue;
                    items.push({
                        id: String(doc._id) + "-" + c.username,
                        type: "comment",
                        username: c.username,
                        profilePicture: c.userPicture,
                        comment: c.userComment,
                        post_id: doc.post_id,
                        time: timeOf(doc._id)
                    });
                }
            }

            items.sort((a, b) => b.time - a.time);

            res.json({ items });
        } catch (err) {
            console.log("notificationController list: " + err);
            res.status(500).json({ error: "Bildirimler alınamadı" });
        }
    }
}

module.exports = notificationController;
