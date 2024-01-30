
const express = require("express");
const app = express();
const postUser = require("../Model/postUser");


class postController {


    async uploadPhoto(req, res, photos, sessionUserName) {


        let photo1 = "";
        let photo2 = "";
        let photo3 = "";
        let photo4 = "";
        let textArea = req.body.textArea;


        photos.slice(0, 4).forEach((photo, index) => {
            switch (index) {
                case 0:
                    photo1 = photo.originalname;
                    break;
                case 1:
                    photo2 = photo.originalname;
                    break;
                case 2:
                    photo3 = photo.originalname;
                    break;
                case 3:
                    photo4 = photo.originalname;
                    break;
                default:
                    break;
            }
        });


        const userInfo = await postUser.userInfo(sessionUserName);
        const user_id = userInfo._id;
        const profilePhoto = userInfo.profilePicture;

        const a = await postUser.postAdd(sessionUserName, user_id, profilePhoto, photo1, photo2, photo3, photo4, textArea);

        res.redirect("/");


    }

    async likePhoto(data) {

        
        const a = await postUser.likeNewPost(data);

    }

    async deleteLikePhoto(data) {

        
        const a = await postUser.deleteLikePost(data);

    }


}

module.exports = postController;