const express = require("express");
const userRouter = express.Router();
const isLogin = require("../../middlewares/isLogin");
const storage = require("../../config/cloudinary");
const multer = require("multer");

// IMPORT ALL CONTROLLER MODULE
const {
  userRegisterCtrl,
  userLoginCtrl,
  usersCtrl,
  userProfileCtrl,
  profilePhotoUploadCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  unfollowCtrl,
  blockCtrl,
  unblockCtrl,
  updateUserProfileCtrl,
  updateUserPasswordCtrl,
  deleteAccountCtrl,
} = require("../../controllers/users/userCtrl");

// Instance Of Multer
const upload = multer({ storage });

// Create User
// http://localhost:1200/api/v1/users/register
userRouter.post("/register", userRegisterCtrl);

// Login User
// http://localhost:1200/api/v1/users/login
userRouter.post("/login", userLoginCtrl);

// Get All Users
// http://localhost:1200/api/v1/users
userRouter.get("/", isLogin, usersCtrl);

// GetMY PROFILE
// http://localhost:1200/api/v1/users/:id
userRouter.get("/my-profile/", isLogin, userProfileCtrl);

// PROFILE PHOTO UPLOAD
// http://localhost:1200/api/v1/users/:id
userRouter.post("/profile-photo-upload", isLogin, upload.single("Profile"), profilePhotoUploadCtrl);

// WHO VIWED MY PROFILE
// http://localhost:1200/api/v1/users/profile-viewers/:id
userRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfileCtrl);

// FOLLOWING
// http://localhost:1200/api/v1/users/following/:id
userRouter.get("/following/:id", isLogin, followingCtrl);

// UNFOLLOW
// http://localhost:1200/api/v1/users/unfollow/:id
userRouter.get("/unfollow/:id", isLogin, unfollowCtrl);

// BLOCK
// http://localhost:1200/api/v1/users/block/123
userRouter.get("/block/:id", isLogin, blockCtrl);

// UNBLOCK
// http://localhost:1200/api/v1/users/block/123
userRouter.get("/unblock/:id", isLogin, unblockCtrl);

// UPDATE USER PROFILE
// http://localhost:1200/api/v1/users/update-user-profile/123
userRouter.put("/update-user-profile", isLogin, updateUserProfileCtrl);

// UPDATE USER PROFILE
// http://localhost:1200/api/v1/users/update-user-password/
userRouter.put("/update-user-password", isLogin, updateUserPasswordCtrl);

// USER DELETE ACCOUNT
// http://localhost:1200/api/v1/users/update-user-password/
userRouter.delete("/delete-account", isLogin, deleteAccountCtrl);

module.exports = userRouter;
