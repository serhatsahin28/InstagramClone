const storyModel = require("../Model/storyModel");
const ObjectId = require('mongoose').ObjectId;
const { storedFileName } = require("../middleware/upload");
const storyLike = require("../Model/table/storyLike");
const storyView = require("../Model/table/storyView");
const User = require("../Model/table/dbUsers");
class storyController {

    async story(req, res, sessionUserName, visitUsername, visitId) {

        try {

            const allStory = await storyModel.allStory(sessionUserName);
            const storySelected = await storyModel.storySelected(sessionUserName, visitUsername, visitId);

            const current = storySelected[0];
            const currentIndex = allStory.findIndex((s) => String(s._id) === String(current._id));

            let nextResult = null;
            let prevResult = null;

            if (currentIndex !== -1) {
                // Komşu hikayelerde farklı bir kullanıcıya ait ilk kaydı ara.
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (allStory[i].username !== current.username) {
                        prevResult = allStory[i];
                        break;
                    }
                }

                for (let i = currentIndex + 1; i < allStory.length; i++) {
                    if (allStory[i].username !== current.username) {
                        nextResult = allStory[i];
                        break;
                    }
                }
            }

            res.json({ allStory, storySelected, nextResult, sessionUserName, prevResult, visitId, visitUsername });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Bir hata oluştu" });

        }


    }



async uploadStory(req,res,photos, sessionUserName){
    const photosName=storedFileName(photos[0]);
    const a=await storyModel.storyAdd(photosName,sessionUserName);
    res.json({ message: "Story eklendi" });
}

async storyDelete(username,user_id){
    const a=await storyModel.storyDelete(username,user_id);
}

// Hikaye açıldığında kaydedilir; kendi hikayeni izlemen sayılmaz.
async view(req, res, storyId, sessionUserName) {
    try {
        const owner = await storyModel.storySelected(sessionUserName, null, storyId);
        if (owner[0] && owner[0].username === sessionUserName) {
            return res.json({ message: "kendi hikayen" });
        }

        const user = await User.findOne({ username: sessionUserName });
        await storyView.updateOne(
            { story_id: storyId, "viewers.username": { $ne: sessionUserName } },
            {
                $setOnInsert: { story_id: storyId },
                $push: {
                    viewers: {
                        username: sessionUserName,
                        userPicture: user?.profilePicture,
                        userProfileName: user?.profileName,
                        viewedAt: new Date()
                    }
                }
            },
            { upsert: true }
        );

        res.json({ message: "görüntülendi" });
    } catch (error) {
        console.log("storyController view: " + error);
        res.status(500).json({ error: "Bir hata oluştu" });
    }
}

async toggleLike(req, res, storyId, sessionUserName, like) {
    try {
        if (like) {
            const user = await User.findOne({ username: sessionUserName });
            const existing = await storyLike.findOne({ story_id: storyId, "userWhoLike.username": sessionUserName });
            if (!existing) {
                await storyLike.updateOne(
                    { story_id: storyId },
                    {
                        $setOnInsert: { story_id: storyId },
                        $push: {
                            userWhoLike: {
                                username: sessionUserName,
                                userPicture: user?.profilePicture,
                                userProfileName: user?.profileName
                            }
                        }
                    },
                    { upsert: true }
                );
            }
        } else {
            await storyLike.updateOne(
                { story_id: storyId },
                { $pull: { userWhoLike: { username: sessionUserName } } }
            );
        }

        res.json({ liked: !!like });
    } catch (error) {
        console.log("storyController toggleLike: " + error);
        res.status(500).json({ error: "Bir hata oluştu" });
    }
}

// Görüntüleyenler listesi; her satırda o kişi beğenmiş mi bilgisi de var.
async viewers(req, res, storyId) {
    try {
        const [viewDoc, likeDoc] = await Promise.all([
            storyView.findOne({ story_id: storyId }),
            storyLike.findOne({ story_id: storyId })
        ]);

        const likedUsernames = new Set((likeDoc?.userWhoLike || []).map((u) => u.username));

        const viewers = (viewDoc?.viewers || [])
            .slice()
            .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
            .map((v) => ({ ...v.toObject(), liked: likedUsernames.has(v.username) }));

        res.json({ viewers, likeCount: likedUsernames.size });
    } catch (error) {
        console.log("storyController viewers: " + error);
        res.status(500).json({ error: "Bir hata oluştu" });
    }
}




}
module.exports = storyController;