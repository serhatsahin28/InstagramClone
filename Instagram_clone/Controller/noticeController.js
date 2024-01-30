
const express = require("express");
const app = express();
const postUser = require("../Model/postUser");


class noticeController {


    async acceptFollow(data) {
        try {

          
            const userName=data.userName;
            const profileName=data.profileName;
            const a = postUser.acceptFollow(userName,profileName);

        } catch (error) {
            console.log("noticeController.js sayfası acceptFollow function: " + error);
        }

    }
    async deleteFollow(data) {
        try {
           
            const userName=data.userName;
            const profileName=data.profileName;
            const a = postUser.deleteFollow(userName,profileName);

        } catch (error) {
            console.log("noticeController.js sayfası deleteFollow function: " + error);
        }

    }






}

module.exports = noticeController;