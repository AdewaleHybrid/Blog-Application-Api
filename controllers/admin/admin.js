const User = require("../../model/User/User"); // User Model
const bcrypt = require("bcryptjs"); // Hashing Password
const generateToken = require("../../utils/generateTokens"); // Token Generation
const getTokenFromHeader = require("../../utils/getTokenFromHeader");
const appErr = require("../../utils/appErr"); // Application Error
const Post = require("../../model/Post/Post");
const Comment = require("../../model/Comment/Comment");
const Category = require("../../model/Category/Category");
const Admin = require("../../model/Admin/Admin");

// ADMIN REGISTER CONTROLLER
const adminRegisterCtrl = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    // Check If the admin is already registered by checking the Email
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      next(appErr("Admin Already registered"), 500);
    }
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create User
    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    res.json({
      status: "Success",
      data: admin,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// ADMIN LOGIN CONTOLLER
const adminLoginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check if email exists --------
    const adminFound = await Admin.findOne({ email }); // Verify Password
    if (!adminFound) {
      return next(appErr("Invalid login credentials"));
    }
    // Verify Password
    const isPasswordMatched = await bcrypt.compare(password, adminFound.password);
    if (!isPasswordMatched) {
      return next(appErr("Invalid login credentials"));
    }
    res.json({
      status: "Success",
      data: {
        userID: adminFound.id,
        firstname: adminFound.firstName,
        lastName: adminFound.lastName,
        email: adminFound.email,
        isAdmin: adminFound.isAdmin,
        token: generateToken(adminFound._id),
      },
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// GET: ADMIN FECTH ALL USERS CONTROLLER
const allUsers = async (req, res, next) => {
  try {
    // Get all users
    const users = await User.find();
    res.json({
      status: "Success",
      result: users.length,
      data: { users },
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// GET: FETCH MY PROFILE
const adminProfileCtrl = async (req, res, next) => {
  try {
    //  const token = getTokenFromHeader(req);
    const admin = await Admin.findById(req.userAuth);
    res.json({
      status: "Success",
      data: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isBlocked: admin.isBlocked,
        followers: admin.followers,
        following: admin.following,
        posts: admin.posts,
        blocked: admin.blocked,
      },
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ADMIN UPDATE CONTROLLER
const updateAdminProfileCtrl = async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  try {
    // check if email is already taken

    // Update the user
    if (email) {
      const emailTaken = await Admin.findOne({ email });
      if (emailTaken) {
        return next(appErr("Email is already taken", 400));
      }
    }
    const admin = await Admin.findByIdAndUpdate(req.userAuth, { firstName, lastName, email }, { new: true, runValidation: true });
    //  await user.save();
    res.json({
      status: "Success",
      data: admin,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ADMIN PASSWORD UPDATE CONTROLLER
const updateAdminPasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const admin = await Admin.findByIdAndUpdate(req.userAuth, { password: hashedPassword }, { new: true, runValidation: true });
      res.json({
        status: "Success",
        data: "Password updated successfully",
      });
    } else {
      return next(appErr("Please Provide new password"));
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Admin PROFILE PHOTO UPLOAD CONTROLLER
const profilePhotoUploadCtrl = async (req, res, next) => {
  try {
    //1. Find the admin to be updated
    const adminToUpdate = await Admin.findById(req.userAuth);
    //2. check if the admin is found
    if (!adminToUpdate) {
      return next(appErr("Admin not found", 404));
    }
    //3. Check if the admin is blocked
    if (adminToUpdate.isBlocked) {
      return next(appErr("Action not allowed, Your Account is blocked", 404));
    }
    //4. Check if the admin is updating profile photo
    if (req.file) {
      // Update the profile photo
      await Admin.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
      res.json({
        status: "Success",
        data: "You have successfully Updated You Profile Photo",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

// ADMIN VIEW  USER'S PROFILE
const adminViewUserProfile = async (req, res, next) => {
  try {
    //1. find the orignial user
    const user = await User.findById(req.params.id);
    //2. find the user who viewed the original user
    const adminWhoViewed = await Admin.findById(req.userAuth);
    //3. check if original user and who viwed are found
    if (user && adminWhoViewed) {
      res.json({
        status: "Success",
        data: {
          userID: user.id,
          fullName: user.fullName,
          lastName: user.lastName,
          follower: user.followers,
          following: user.following,
          posts: user.posts,
          level: user.userAward,
          "Number of posts": user.NumberOfPosts,
          "Number of followers": user.NumberOfFollowers,
          "Number of following": user.NumberOfFollowing,
        },
      });
    }
    if (!user) {
      next(appErr("User not found", 404));
    }
    if (!adminWhoViewed) {
      next(appErr(error.message));
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ADMIN FOLLOWING A USERS CONTROLLER
const adminFollowingUserCtrl = async (req, res, next) => {
  try {
    //1. Find a User to follow
    const userToFollow = await User.findByIdAndUpdate(req.params.id);

    //2. Find the user who wants to follow amother user
    const adminWhoFollowed = await Admin.findById(req.userAuth);

    //3. Check if user to follow and user who followed are found
    if (userToFollow && adminWhoFollowed) {
      //4. check if user whofollowed is already in the user to follow array
      const isUserAlreadyfollowed = userToFollow.followers.find((follower) => follower._id.toString() == adminWhoFollowed._id.toString());
      if (isUserAlreadyfollowed) {
        return next(appErr("You are already following this user"));
      } else {
        //5. Push user who followed to user's follower array
        userToFollow.followers.push(adminWhoFollowed._id);

        //6. Push userToFollow to the userWhoFollowed's folowing array
        adminWhoFollowed.following.push(userToFollow._id);

        //7. save
        await userToFollow.save();
        await adminWhoFollowed.save();
        res.json({
          status: "Success",
          data: "You have Successfully followed this user",
        });
      }
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

// UNFOLLOWING  USER'S CONTROLLER
const adminUnfollowUserCtrl = async (req, res, next) => {
  try {
    //1. Find a User to unfollow
    const userToBeUnfollowed = await User.findById(req.params.id);

    //2. Find the admin who wants to unfollow a user
    const adminWhoUnfollowed = await Admin.findById(req.userAuth);

    //3. Check if user to follow and user who followed are found
    if (userToBeUnfollowed && adminWhoUnfollowed) {
      // check if user whofollowed is already in the user to follow array
      const isUserAlreadyfollowed = userToBeUnfollowed.followers.find((follower) => follower.toString() === adminWhoUnfollowed._id.toString());
      if (!isUserAlreadyfollowed) {
        return next(appErr("You have not followed this user"));
      } else {
        //5. Remove user who unfollowed from the user's follower array
        userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
          (follower) => follower._id.toString() !== adminWhoUnfollowed._id.toString()
        );
        //6. save
        await userToBeUnfollowed.save();
        //7. Remove userToBeUnfollowed from the userWhoUnfollowed's following array
        adminWhoUnfollowed.following = userToBeUnfollowed.followers.filter(
          (follower) => follower._id.toString() !== userToBeUnfollowed._id.toString()
        );
        await adminWhoUnfollowed.save();
        res.json({
          status: "Success",
          data: "You have Successfully unfollowed this user",
        });
      }
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// ADMIN-BLOCK USERS CONTROLLER
const adminBlockUserCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be blocked
    const userToBeBlocked = await User.findById(req.params.id);
    if (!userToBeBlocked) {
      return next(appErr("User not found"));
    }
    userToBeBlocked.isBlocked = true;
    // Save the User
    userToBeBlocked.save();
    res.json({
      status: "Success",
      data: "You have Successfully Blocked This User",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ADMIN-UnbLOCK USERS CONTROLLER
const adminUnblockUserCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be unblocked
    const userToBeUnlocked = await User.findById(req.params.id);
    if (!userToBeUnlocked) {
      return next(appErr("User not found"));
    }
    userToBeUnlocked.isBlocked = false;
    // Save the User
    userToBeUnlocked.save();
    res.json({
      status: "Success",
      data: "You have Successfully Unblocked This User",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ADMIN DELETE ACCOUNT CONTROLLER
const deleteAccountCtrl = async (req, res, next) => {
  try {
    //1. find the admin to be deleted
    const adminToDelete = await Admin.findById(req.userAuth);
    //2. Delete all posts created by this admin
    await Post.deleteMany({ user: req.userAuth });
    //3. Delete all comment created by this admin
    await Comment.deleteMany({ user: req.userAuth });
    //4. Delete all category created by this admin
    await Category.deleteMany({ user: req.userAuth });
    //5. Delete the admin account
    await adminToDelete.deleteOne();
    return res.json({
      status: "Success",
      data: "Account deleted successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ADMIN FETCH NUMBER OF USERS
const numberOfUsersCtrl = async (req, res, next) => {
  try {
    const numberOfUsers = await User.countDocuments();
    return res.json({ status: "Success", "total users": numberOfUsers });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

// EXPORT ALL MODULES
module.exports = {
  numberOfUsersCtrl,
  adminFollowingUserCtrl,
  deleteAccountCtrl,
  adminProfileCtrl,
  adminRegisterCtrl,
  adminLoginCtrl,
  allUsers,
  profilePhotoUploadCtrl,
  adminViewUserProfile,
  adminUnfollowUserCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updateAdminProfileCtrl,
  updateAdminPasswordCtrl,
};
