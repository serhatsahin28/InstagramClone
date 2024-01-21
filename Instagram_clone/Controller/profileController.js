const express = require("express");
const app = express();
const UserModel = require("../Model/userModel");
const UserController = require("./UserController");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

class Profile extends UserController {
  constructor(username, password) {
    super(username, password);
    this.name = username;
    this.year = password;
  }

  async profile(req, res, username, sessionUserName, sessionProfileName) {
    try {

      const result = await UserModel.findUserByUsername(username);
      const posts = await UserModel.findPostByUser(username);
      const followedUser = await UserModel.findAllFollowed(username, sessionUserName);//followedUser ile oturumu açık olan kullanıcı,profiline girilen kullanıcıyı takip ediyor mu kontrol ediyoruz
      const followersUser = await UserModel.findAllFollowers(username, sessionUserName);//followersUser ile profiline girilen kullanıcıyı,session'ı açık olan kullanıcı takip ediyor mu kontrol ediyoruz

      // res.json("followersUser"+followedUser);



      let followData = null;



      if (followedUser != "") {

        const Isfollowed = followedUser[0].followed[0].situation;//Profiline Girilen Kullanıcıyı Takip ediyor muyuz?
        let Isfollowers = "";
        let followersName = "";

        if (followersUser != "") {

          Isfollowers = followersUser[0].followed[0].situation;//Profiline Girilen Kullanıcı Aktif Kullanıcıyı Takip Ediyor Mu?


          followersName = followersUser[0].followed[0].username;//Profiline girilen kullanıcı bizi takip ediyorsa adı

        }



        followData = { followedUser, followersUser, Isfollowers, Isfollowed };

      }
      else {

        followData = "";
      }




      const userName = sessionUserName;







      if (username == userName) {
        res.render("profile", { result, posts, userName });

      }
      else {
        res.render("otherProfile", { result, posts, userName, sessionProfileName, followData });

      }
    }
    catch (err) {
      console.log(err);

    }


  }




  async followProfile(userName, data) {
    const sessionUserName = userName;
    const otherUserName = data.username;

    const otherUserId = data._id;
    const sessionUserProfile = data.userSessionProfile;

    const situation = data.situation;

    const profileName = data.profileName;
    const profilePicture = data.profilePicture;

    await UserModel.followSend(sessionUserName, otherUserId, sessionUserProfile, otherUserName, situation, profileName, profilePicture);
  }



  async unfollowProfile(userName, formData) {
    const profileName = formData.profileName;
    const sessionUserProfile = userName;
    console.log("profileName: " + profileName);
    console.log("SessionName: "+sessionUserProfile);


    await UserModel.unFollowed(profileName, sessionUserProfile);

  }







}


module.exports = Profile;
