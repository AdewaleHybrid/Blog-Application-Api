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
} = require("../../controllers/admin/admin");

// Instance Of Multer
const upload = multer({ storage });

// Create Admin
// http://localhost:1200/api/v1/users/register
adminRouter.post("/register", adminRegisterCtrl);

// Login User
// http://localhost:1200/api/v1/users/login
adminRouter.post("/login", adminLoginCtrl);

// Get All Users
// http://localhost:1200/api/v1/admins
adminRouter.get("/", isLogin, isAdmin, allUsers);

// GetMY PROFILE
// http://localhost:1200/api/v1/users/:id
adminRouter.get("/my-profile/", isLogin, isAdmin, adminProfileCtrl);

// PROFILE PHOTO UPLOAD
// http://localhost:1200/api/v1/users/:id
adminRouter.post("/profile-photo-upload", isLogin, isAdmin, upload.single("Profile"), profilePhotoUploadCtrl);

// WHO VIEWED MY PROFILE
// http://localhost:1200/api/v1/users/profile-viewers/:id
adminRouter.get("/profile-viewers/:id", isLogin, isAdmin, adminViewUserProfile);

// FOLLOWING
// http://localhost:1200/api/v1/users/following/:id
adminRouter.get("/following/:id", isLogin, isAdmin, adminFollowingUserCtrl);

// UNFOLLOW
// http://localhost:1200/api/v1/users/unfollow/:id
adminRouter.get("/unfollow/:id", isLogin, isAdmin, adminUnfollowUserCtrl);

// ADMIN-BLOCK USER
// http://localhost:1200/api/v1/users/admin-block/123
adminRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl);

// ADMIN-UNBLOCK USER
// http://localhost:1200/api/v1/users/admin-block/123
adminRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnblockUserCtrl);

// UPDATE USER PROFILE
// http://localhost:1200/api/v1/users/update-user-profile/123
adminRouter.put("/update-admin-profile", isLogin, isAdmin, updateAdminProfileCtrl);

// UPDATE USER PROFILE
// http://localhost:1200/api/v1/users/update-user-password/
adminRouter.put("/update-admin-password", isLogin, isAdmin, updateAdminPasswordCtrl);

// USER DELETE ACCOUNT
// http://localhost:1200/api/v1/users/update-user-password/
adminRouter.delete("/delete-account", isLogin, isAdmin, deleteAccountCtrl);

module.exports = adminRouter;
