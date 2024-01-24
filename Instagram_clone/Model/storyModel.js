const User = require("../Model/table/dbUsers");
const Post = require("../Model/table/postUser");
const follow = require("../Model/table/follow");
const story = require("../Model/table/storyTable");

class storyModel {

    static async storySelected(sessionUserName, visitUsername, visitId) {

        try {
            const storySelected = await story.find({
                "username": visitUsername
            });




            return storySelected;
        }
        catch (err) {
            console.log(err);
        }


    }


    static async allStory(sessionUserName, visitUsername, visitId) {

        try {
            const followed = await follow.find({
                "userName": sessionUserName,
                "followed.situation": true
            });
            const user = followed.map(item => item.followed[0].username);
            const stories = await story.find({
                "username": user
            });
            return stories;

        }
        catch (err) {
            console.log(err);
        }


    }




}


module.exports = storyModel;