const storyModel = require("../Model/storyModel");
const ObjectId = require('mongoose').ObjectId;
class storyController {

    async story(req, res, sessionUserName, visitUsername, visitId) {

        try {

            const allStory = await storyModel.allStory(sessionUserName, visitUsername, visitId);
            const storySelected = await storyModel.storySelected(sessionUserName, visitUsername, visitId);

            let nextResult = null;
            let prevResult = null;

            let targetId = storySelected[0]._id;
            let currentIndex = -1;

            // Verinin index'ini bul
            for (let i = 0; i < allStory.length; i++) {
                if (allStory[i]._id.equals(targetId)) {
                    currentIndex = i;
                    break;
                }
            }

            if (currentIndex !== -1) {
                let prevIndex = currentIndex - 1;
                let nextIndex = currentIndex + 1;

                // Önceki veriyi al
                while (prevIndex >= 0) {
                    if (allStory[prevIndex].username !== visitUsername) {
                        prevResult = allStory[prevIndex];
                        // console.log('prevResult:', prevResult);
                        break; // Uygun bir önceki veri bulundu, döngüden çık
                    } else {
                        console.log('Önceki kullanıcıya ait veri yok, bir önceki index denenecek.');
                        prevIndex--;

                        // Döngüden çıkmadan önce sınırları kontrol et
                        if (prevIndex < 0) {
                            break;
                        }
                    }
                }

                // Bir sonraki veriyi al
                while (nextIndex < allStory.length) {
                    if (allStory[nextIndex].username !== visitUsername) {
                        nextResult = allStory[nextIndex];
                        // console.log('nextResult:', nextResult);
                        break; // Uygun bir sonraki veri bulundu, döngüden çık
                    } else {
                        console.log('Sonraki kullanıcıya ait veri yok, bir sonraki index denenecek.');
                        nextIndex++;
                    }
                }
            } else {
                console.log('Veri bulunamadı.');
            }


            console.log("prevResult: " + prevResult);
            console.log("nextResult: " + nextResult);



            res.render("story", { allStory, storySelected, nextResult, sessionUserName, prevResult,visitId,visitUsername });
        }
        catch (error) {
            console.log(error);

        }


    }



async uploadStory(req,res,photos, sessionUserName){
    const photosName=photos[0].originalname;
    const a=await storyModel.storyAdd(photosName,sessionUserName);
res.redirect("/");
}

async storyDelete(username,user_id){
    const a=await storyModel.storyDelete(username,user_id);
}




}
module.exports = storyController;