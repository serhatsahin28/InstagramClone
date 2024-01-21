const storyModel = require("../Model/storyModel");

class storyController {

    async story(req, res, sessionUserName, visitUsername, visitId) {

        try {

            const allStory = await storyModel.allStory(sessionUserName, visitUsername, visitId);
            const storySelected = await storyModel.storySelected(sessionUserName, visitUsername, visitId);


            let selectedNumber = "";
            for (let i = 0; i < allStory.length; i++) {
                if (allStory[i].username == visitUsername) {
                    selectedNumber = i + 1;
                }
            }






            res.render("story", { allStory, storySelected, selectedNumber });
        }
        catch (error) {
            console.log(error);

        }


    }





}

module.exports = storyController;