const storyModel = require("../Model/storyModel");
const ObjectId = require('mongoose').ObjectId;
const { storedFileName } = require("../middleware/upload");
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




}
module.exports = storyController;