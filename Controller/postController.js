
const express = require("express");
const app = express();
const postUser = require("../Model/postUser");
const { storedFileName } = require("../middleware/upload");
const likePost = require("../Model/table/likePost");
const Post = require("../Model/table/postUser");


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


    // Beğenenler listesi: socket üzerinden herkese yayın yapmak yerine
    // doğrudan, hedefe özel ve indeksli tek sorgu (belirgin şekilde hızlı).
    async getLikes(req, res, postId) {
        try {
            const docs = await likePost.find({ post_id: postId }, "userWhoLike");
            const users = docs.flatMap((d) => d.userWhoLike);
            res.json({ users });
        } catch (error) {
            console.log("postController getLikes: " + error);
            res.status(500).json({ error: "Beğeniler alınamadı" });
        }
    }

    // Keşfet: takip durumundan bağımsız, rastgele karışık gönderiler.
    async explore(req, res) {
        try {
            const posts = await Post.aggregate([{ $sample: { size: 60 } }]);
            res.json({ posts });
        } catch (error) {
            console.log("postController explore: " + error);
            res.status(500).json({ error: "Keşfet yüklenemedi" });
        }
    }

    // Aciklamasinda verilen #hashtag'i gecen gonderiler; kelime sinirlariyla
    // eslesir (ornegin "#cat" "#category" ile karismaz).
    async getByHashtag(req, res, tag) {
        try {
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const pattern = new RegExp(`(^|\\s)#${escaped}(\\s|$)`, "i");
            const posts = await Post.find({ description: pattern }).sort({ _id: -1 });
            res.json({ posts });
        } catch (error) {
            console.log("postController getByHashtag: " + error);
            res.status(500).json({ error: "Gönderiler alınamadı" });
        }
    }

    async getOne(req, res, postId) {
        try {
            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ error: "Gönderi bulunamadı" });
            res.json({ post });
        } catch (error) {
            console.log("postController getOne: " + error);
            res.status(500).json({ error: "Gönderi alınamadı" });
        }
    }

    // Sadece gonderi sahibi kendi caption'ini duzenleyebilir.
    async updateDescription(req, res, postId, sessionUserName, description) {
        try {
            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ error: "Gönderi bulunamadı" });
            if (post.username !== sessionUserName) return res.status(403).json({ error: "Bu gönderiyi düzenleyemezsin" });

            post.description = typeof description === "string" ? description.trim() : "";
            await post.save();
            res.json({ post });
        } catch (error) {
            console.log("postController updateDescription: " + error);
            res.status(500).json({ error: "Gönderi güncellenemedi" });
        }
    }

async postDelete(data){

const sessionUserName=data.sessionUserName;
const postId=data.imgId;
return await postUser.deletePost(postId, sessionUserName);

}








}

module.exports = postController;