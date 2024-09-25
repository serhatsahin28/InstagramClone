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
      const sessionProfilePicture = req.session.user.profilePicture;
      const profileName = req.session.user.profileName;
      const followedProfile = await UserModel.findProfileFollowed(username);
      const followersProfile = await UserModel.findProfileFollowers(username);
      const findProfilePosts = await UserModel.findProfilePosts(username);
      const noticeFollow = await UserModel.findFollowSend(sessionUserName);
      const followersTrue = await UserModel.findAllFollowersTrue(sessionUserName);


      // res.json("followersUser"+followedUser);
      const isPrivate = result[0].isPrivate;
      let followData = null;

      let Isfollowed = "";


      if (followedUser != "") {

        Isfollowed = followedUser[0].followed[0].situation;//Profiline Girilen Kullanıcıyı Takip ediyor muyuz?
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



      // console.log("Isfollowed:  " + Isfollowed);
      // console.log("sessionProfilePicturexxxxx--:  " + sessionProfilePicture);


      if (username == userName) {
        res.render("profile", { result, posts, userName, sessionProfilePicture, profileName,followedProfile,followersProfile,findProfilePosts,noticeFollow,followersTrue });

      }
      else {
        if (isPrivate == true && Isfollowed == true) {
          res.render("otherProfile", { result, posts, userName, sessionProfileName, followData, sessionProfilePicture, profileName,followedProfile,followersProfile,findProfilePosts,noticeFollow,followersTrue});
        }
        else if(isPrivate!=true)
        {
          res.render("otherProfile", { result, posts, userName, sessionProfileName, followData, sessionProfilePicture, profileName,followedProfile,followersProfile,findProfilePosts,noticeFollow,followersTrue});


        }
        else {

          res.render("privateOtherProfile", { result, posts, userName, sessionProfileName, followData, sessionProfilePicture, profileName,followedProfile,followersProfile,findProfilePosts,noticeFollow,followersTrue });

        }
      }
    }
    catch (err) {
      console.log(err);

    }


  }




  async followProfile(userName, data) {

     console.log("followProfile verileriiii: " + JSON.stringify(data, null, 2));
     console.log("userSessionPicture++++ bbbb"+data.userSessionPicture);
     console.log("profilePicture++++bbbbb"+data.profilePicture);
    const sessionUserName = userName;
    const otherUserName = data.username;

    const otherUserId = data._id;
    const sessionUserProfile = data.userSessionProfile;

    const situation = data.situation;
    const sessionProfileName = data.sessionProfileName;
    const profileName = data.profileName;
    const profilePicture = data.profilePicture;
    const userSessionPicture = data.userSessionPicture;

    console.log("userSessionPicture++++"+userSessionPicture);
    console.log("profilePicture++++"+profilePicture);
     await UserModel.followSend(sessionUserName, otherUserId, sessionUserProfile, otherUserName, profileName, profilePicture, userSessionPicture, sessionProfileName);
  }


  async followRequest(userName, data) {

    const sessionUserName = userName;
    const otherUserName = data.username;

    const otherUserId = data._id;
    const sessionUserProfile = data.userSessionProfile;

    const situation = data.situation;
    const sessionProfileName = data.sessionProfileName;
    const profileName = data.profileName;
    const profilePicture = data.profilePicture;
    const userSessionPicture = data.userSessionPicture;

    if(userSessionPicture!=null &&profilePicture!=null){
      // console.log("Data değerleri:", JSON.stringify(data, null, 2)); 
      // console.log("SESSION PROFILENAME: "+userSessionPicture);
      // console.log("profilePicture PROFILENAME: "+profilePicture);
  
  
  }

    await UserModel.followRequest(sessionUserName, otherUserId, sessionUserProfile, otherUserName, profileName, profilePicture, userSessionPicture, sessionProfileName);
  }


  async unfollowProfile(userName, formData) {
    const profileName = formData.profileName;
    const sessionUserProfile = userName;
    console.log("profileName: " + profileName);
    console.log("SessionName: " + sessionUserProfile);


    await UserModel.unFollowed(profileName, sessionUserProfile);

  }






}


module.exports = Profile;
