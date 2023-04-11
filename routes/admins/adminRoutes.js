const express = require("express");
const adminRouter = express.Router();
const isLogin = require("../../middlewares/isLogin");
const isAdmin = require("../../middlewares/isAdmin");
const storage = require("../../config/cloudinary");
const multer = require("multer");

// IMPORT ALL CONTROLLER MODULE
const {
  adminRegisterCtrl,
  adminFollowingUserCtrl,
  deleteAccountCtrl,
  adminProfileCtrl,
  adminLoginCtrl,
  allUsers,
  profilePhotoUploadCtrl,
  adminViewUserProfile,
  adminUnfollowUserCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updateAdminProfileCtrl,
  updateAdminPasswordCtrl,
  numberOfUsersCtrl,
} = require("../../controllers/admin/admin");

// Instance Of Multer
const upload = multer({ storage });

// Create Admin
// http://localhost:1200/api/v1/admins/register
adminRouter.post("/register", adminRegisterCtrl);

// Login User
// http://localhost:1200/api/v1/admins/login
adminRouter.post("/login", adminLoginCtrl);

// Get All Users
// http://localhost:1200/api/v1/admins
adminRouter.get("/", isLogin, isAdmin, allUsers);

// GetMY PROFILE
// http://localhost:1200/api/v1/admins/:id
adminRouter.get("/my-profile/", isLogin, isAdmin, adminProfileCtrl);

// PROFILE PHOTO UPLOAD
// http://localhost:1200/api/v1/admins/:id
adminRouter.post("/profile-photo-upload", isLogin, isAdmin, upload.single("Profile"), profilePhotoUploadCtrl);

// WHO VIEWED MY PROFILE
// http://localhost:1200/api/v1/admins/profile-viewers/:id
adminRouter.get("/profile-viewers/:id", isLogin, isAdmin, adminViewUserProfile);

// FOLLOWING
// http://localhost:1200/api/v1/admins/following/:id
adminRouter.get("/following/:id", isLogin, isAdmin, adminFollowingUserCtrl);

// UNFOLLOW
// http://localhost:1200/api/v1/admins/unfollow/:id
adminRouter.get("/unfollow/:id", isLogin, isAdmin, adminUnfollowUserCtrl);

// ADMIN-BLOCK USER
// http://localhost:1200/api/v1/admins/admin-block/123
adminRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl);

// ADMIN-UNBLOCK USER
// http://localhost:1200/api/v1/admins/admin-block/123
adminRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnblockUserCtrl);

// UPDATE USER PROFILE
// http://localhost:1200/api/v1/admins/update-user-profile/123
adminRouter.put("/update-admin-profile", isLogin, isAdmin, updateAdminProfileCtrl);

// UPDATE USER PROFILE
// http://localhost:1200/api/v1/admins/update-user-password/
adminRouter.put("/update-admin-password", isLogin, isAdmin, updateAdminPasswordCtrl);

// ADMIN DELETE ACCOUNT
// http://localhost:1200/api/v1/admins/delete-account/
adminRouter.delete("/delete-account", isLogin, isAdmin, deleteAccountCtrl);

// ADMIN FETCH NUMBER OF USERS
// http://localhost:1200/api/v1/admins/user-count
adminRouter.get("/user-count", isLogin, isAdmin, numberOfUsersCtrl);

module.exports = adminRouter;
