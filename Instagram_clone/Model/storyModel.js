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


    static async storyAdd(photosName, sessionUserName) {

        try {
            const userQuery = await User.find({
                "username": sessionUserName
            });
            console.log(userQuery);
            const user_id = userQuery[0]._id;
            const profileName = userQuery[0].profileName;
            const profilePicture = userQuery[0].profilePicture;
   

            const addStory=await story.create({
            "user_id":user_id,
            "username":sessionUserName,
            "profileName":profileName,
            "storie":photosName,
            "profilePicture":profilePicture,
            "isActive":"1"

            });


        }
        catch (err) {
            console.log(err);
        }


    }


    
    static async storyDelete(username,user_id) {

        try {

            const a = await story.deleteOne({
                "_id":user_id,
                "username":username
            });

        }
        catch (err) {
            console.log("storyModel sayfası  storyDelelte içerisi: "+err);
        }


    }


}


module.exports = storyModel;