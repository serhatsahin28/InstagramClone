const reel = require("../Model/table/reel");
const likePost = require("../Model/table/likePost");
const commentPost = require("../Model/table/commentPost");
const User = require("../Model/table/dbUsers");
const { storedFileName } = require("../middleware/upload");

class reelController {
    async upload(req, res, video, sessionUserName, description) {
        try {
            if (!video) return res.status(400).json({ error: "Video gerekli" });

            const user = await User.findOne({ username: sessionUserName });
            const doc = await reel.create({
                user_id: String(user._id),
                username: sessionUserName,
                profilePhoto: user.profilePicture,
                video: storedFileName(video),
                description: description || ""
            });

            res.json({ reel: doc });
        } catch (err) {
            console.log("reelController upload: " + err);
            res.status(500).json({ error: "Reel yüklenemedi" });
        }
    }

    // Kronolojik akis (en yeni once); kisisellestirilmis siralama yok.
    async feed(req, res) {
        try {
            const reels = await reel.find({}).sort({ _id: -1 }).limit(50);
            res.json({ reels });
        } catch (err) {
            console.log("reelController feed: " + err);
            res.status(500).json({ error: "Reels yüklenemedi" });
        }
    }

    // Begeniler, gonderilerle ayni likePost koleksiyonunu kullanir (post_id
    // alani generic oldugu icin reel _id'siyle de calisir); boylece mevcut
    // LikesModal bilesen degistirilmeden reels icin de kullanilabiliyor.
    async toggleLike(req, res, reelId, sessionUserName, like) {
        try {
            const target = await reel.findById(reelId);
            if (!target) return res.status(404).json({ error: "Reel bulunamadı" });

            const user = await User.findOne({ username: sessionUserName });

            if (like) {
                await likePost.updateOne(
                    { post_id: reelId, "userWhoLike.username": { $ne: sessionUserName } },
                    {
                        $setOnInsert: { post_id: reelId, postOwnerUsername: target.username },
                        $push: {
                            userWhoLike: {
                                username: sessionUserName,
                                userPicture: user.profilePicture,
                                userProfileName: user.profileName
                            }
                        }
                    },
                    { upsert: true }
                );
            } else {
                await likePost.updateOne(
                    { post_id: reelId },
                    { $pull: { userWhoLike: { username: sessionUserName } } }
                );
            }

            res.json({ liked: like });
        } catch (err) {
            console.log("reelController toggleLike: " + err);
            res.status(500).json({ error: "Beğeni işlenemedi" });
        }
    }

    async remove(req, res, reelId, sessionUserName) {
        try {
            const target = await reel.findById(reelId);
            if (!target || target.username !== sessionUserName) {
                return res.status(403).json({ error: "Bu reeli silemezsin" });
            }

            await reel.deleteOne({ _id: reelId });
            await likePost.deleteMany({ post_id: reelId });
            await commentPost.deleteMany({ post_id: reelId });

            res.json({ message: "Reel silindi" });
        } catch (err) {
            console.log("reelController remove: " + err);
            res.status(500).json({ error: "Silinemedi" });
        }
    }
}

module.exports = reelController;
