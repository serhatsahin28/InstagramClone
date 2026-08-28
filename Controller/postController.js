
const express = require("express");
const app = express();
const postUser = require("../Model/postUser");
const { storedFileName } = require("../middleware/upload");


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
                    photo1 = storedFileName(photo);
                    break;
                case 1:
                    photo2 = storedFileName(photo);
                    break;
                case 2:
                    photo3 = storedFileName(photo);
                    break;
                case 3:
                    photo4 = storedFileName(photo);
                    break;
                default:
                    break;
            }
        });


        const userInfo = await postUser.userInfo(sessionUserName);
        const user_id = userInfo._id;
        const profilePhoto = userInfo.profilePicture;

        const a = await postUser.postAdd(sessionUserName, user_id, profilePhoto, photo1, photo2, photo3, photo4, textArea);

        res.json({ message: "Gönderi eklendi", post: a });


    }

    async likePhoto(data) {


        const a = await postUser.likeNewPost(data);

    }

    async deleteLikePhoto(data) {


        const a = await postUser.deleteLikePost(data);

    }







    async uploadProfilePhoto(req, res, photos, sessionUserName) {


        const newProfilePhoto = storedFileName(photos[0]);
        console.log(sessionUserName);

        const sessionUserQuery = await postUser.userInfo(sessionUserName);
        const isProfilePhotoNull = sessionUserQuery.profilePicture;


        const updateProfilePhoto = await postUser.updateProfilePhoto(sessionUserName, newProfilePhoto);


        res.json({ message: "Profil fotoğrafı güncellendi", profilePicture: newProfilePhoto });


    }








    async uploadProfileSettings(req, res, photos, sessionUserName) {

        const textArea = req.body.biography;
        let newProfilePhoto = "";
        if (photos != undefined && photos != "") {
            newProfilePhoto = storedFileName(photos[0]);


        }
        else {
            newProfilePhoto = "";

        }

       console.log(textArea);
        const sessionUserQuery = await postUser.userInfo(sessionUserName);
        const isProfilePhotoNull = sessionUserQuery.profilePicture;



            const updateProfilePhoto = await postUser.updateProfileSetting(sessionUserName, newProfilePhoto,textArea);



        res.json({ message: "Ayarlar güncellendi", profilePicture: newProfilePhoto, biography: textArea });


    }


async postDelete(data){

const sessionUserName=data.sessionUserName;
const postId=data.imgId;
console.log("postController.js sayfasında postDelete fonksiyonu içerisinde ");
const deletePost=await postUser.deletePost(postId);

}








}

module.exports = postController;