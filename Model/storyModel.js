const User = require("../Model/table/dbUsers");
const Post = require("../Model/table/postUser");
const follow = require("../Model/table/follow");
const story = require("../Model/table/storyTable");

class storyModel {

    // Tıklanan hikayeyi id'siyle bulur.
    static async storySelected(sessionUserName, visitUsername, visitId) {

        try {
            const selected = await story.find({ "_id": visitId });
            if (selected.length > 0) return selected;

            // id bulunamazsa kullanıcının ilk hikayesine düş.
            return story.find({ "username": visitUsername });
        }
        catch (err) {
            console.log(err);
        }


    }


    // Takip edilenlerin hikayeleri + kendi hikayelerimiz, kronolojik sırada.
    static async allStory(sessionUserName) {

        try {
            const followed = await follow.find({
                "userName": sessionUserName,
                "followed.situation": true
            });

            const users = [];
            for (const doc of followed) {
                for (const f of doc.followed) {
                    if (f.situation) users.push(f.username);
                }
            }
            users.push(sessionUserName);

            // Once en yeniden en eskiye tum hikayeler cekilir, sonra
            // kullaniciya gore gruplanir. Duz kronolojik siralama tek basina
            // yeterli degil: farkli kullanicilarin hikayeleri (ornegin A2,
            // B1, A1 sirasinda) birbirine karisip A'nin halkasini izlerken
            // araya B'nin hikayesi giriyordu. Gruplama sayesinde her
            // kullanicinin kendi hikayeleri (en yeniden en eskiye) bir arada
            // kalir; kullanicilar arasi sira da en son paylasima gore olur
            // (Map, ilk goruldugu sirayi korur - bu da her kullanicinin en
            // yeni hikayesinin geldigi an oldugu icin dogru sirayi verir).
            const stories = await story.find({
                "username": { $in: users }
            }).sort({ _id: -1 });

            const byUser = new Map();
            for (const s of stories) {
                if (!byUser.has(s.username)) byUser.set(s.username, []);
                byUser.get(s.username).push(s);
            }

            const own = byUser.get(sessionUserName) || [];
            byUser.delete(sessionUserName);
            const others = [].concat(...byUser.values());

            return [...own, ...others];

        }
        catch (err) {
            console.log(err);
        }


    }


    static async storyAdd(photosName, sessionUserName, text) {

        try {
            const userQuery = await User.find({
                "username": sessionUserName
            });
            const user_id = userQuery[0]._id;
            const profileName = userQuery[0].profileName;
            const profilePicture = userQuery[0].profilePicture;


            const addStory=await story.create({
            "user_id":user_id,
            "username":sessionUserName,
            "profileName":profileName,
            "storie":photosName,
            "profilePicture":profilePicture,
            "isActive":"1",
            "text": text || undefined

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