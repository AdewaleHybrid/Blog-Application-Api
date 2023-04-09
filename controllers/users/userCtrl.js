const User = require("../../model/User/User"); // User Model
const bcrypt = require("bcryptjs"); // Hashing Password
const generateToken = require("../../utils/generateTokens"); // Token Generation
const getTokenFromHeader = require("../../utils/getTokenFromHeader");
const appErr = require("../../utils/appErr"); // Application Error
const Post = require("../../model/Post/Post");
const Comment = require("../../model/Comment/Comment");
const Category = require("../../model/Category/Category");
const multer = require("multer");

// USER REGISTER CONTROLLER
const userRegisterCtrl = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    // Check If the user is already registered by checking the Email
    const userExists = await User.findOne({ email });
    if (userExists) {
      next(appErr("User Already registered"), 500);
    }
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create User
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// USER LOGIN CONTOLLER
const userLoginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check if email exists --------
    const userFound = await User.findOne({ email }); // Verify Password
    if (!userFound) {
      return next(appErr("Invalid login credentials"));
    }
    // Verify Password
    const isPasswordMatched = await bcrypt.compare(password, userFound.password);
    if (!isPasswordMatched) {
      return next(appErr("Invalid login credentials"));
    }
    res.json({
      status: "Success",
      data: {
        userID: userFound.id,
        firstname: userFound.firstName,
        lastName: userFound.lastName,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// GET ALL USERS CONTROLLER
const usersCtrl = async (req, res, next) => {
  try {
    // Get all users
    const users = await User.find();

    res.json({
      status: "Success",
      data: users,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// GET: FETCH MY PROFILE
const userProfileCtrl = async (req, res, next) => {
  try {
    //  const token = getTokenFromHeader(req);
    const user = await User.findById(req.userAuth);
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// USER UPDATE CONTROLLER
const updateUserProfileCtrl = async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  try {
    // check if email is already taken

    // Update the user
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(appErr("Email is already taken", 400));
      }
    }
    const user = await User.findByIdAndUpdate(req.userAuth, { firstName, lastName, email }, { new: true, runValidation: true });
    //  await user.save();
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// USER PASSWORD UPDATE CONTROLLER
const updateUserPasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.findByIdAndUpdate(req.userAuth, { password: hashedPassword }, { new: true, runValidation: true });
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

// USER PROFILE PHOTO UPLOAD CONTROLLER
const profilePhotoUploadCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be updated
    const userToUpdate = await User.findById(req.userAuth);
    //2. check if the user is found
    if (!userToUpdate) {
      return next(appErr("User not found", 404));
    }
    //3. Check if the user is blocked
    if (userToUpdate.isBlocked) {
      return next(appErr("Action not allowed, Your Account is blocked", 404));
    }
    //4. Check if the user is updating profile photo
    if (req.file) {
      // Update the profile photo
      await User.findByIdAndUpdate(
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

// VIEW ANOTHER USER'S PROFILE
const whoViewedMyProfileCtrl = async (req, res, next) => {
  try {
    //1. find the orignial user
    const user = await User.findById(req.params.id);
    //2. find the user who viewed the original user
    const userWhoViewed = await User.findById(req.userAuth);
    //3. check if original user and who viwed are found
    if (user && userWhoViewed) {
      //4. check if user who viewed is already in the users viewer array
      const isUserAlreadyViewed = user.viewers.find((viewer) => viewer.toString() === userWhoViewed._id.toJSON());
      if (isUserAlreadyViewed) {
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
      } else {
        //5 Push User Who Viwed to the Original user's viewerd array
        user.viewers.push(userWhoViewed._id);
        //6. Save the user
        await user.save();
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
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

// FOLLOWING  USERS CONTROLLER
const followingCtrl = async (req, res, next) => {
  try {
    //1. Find a User to follow
    const userToFollow = await User.findByIdAndUpdate(req.params.id);

    //2. Find the user who wants to follow amother user
    const userWhoFollowed = await User.findById(req.userAuth);

    //3. Check if user to follow and user who followed are found
    if (userToFollow && userWhoFollowed) {
      //4. check if user whofollowed is already in the user to follow array
      const isUserAlreadyfollowed = userToFollow.followers.find((follower) => follower._id.toString() === userWhoFollowed._id.toString());
      if (isUserAlreadyfollowed) {
        return next(appErr("You are already following this user"));
      } else {
        //5. Push user who followed to user's follower array
        userToFollow.followers.push(userWhoFollowed._id);

        //6. Push userToFollow to the userWhoFollowed's folowing array
        userWhoFollowed.following.push(userToFollow._id);

        //7. save
        await userToFollow.save();
        await userWhoFollowed.save();
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
const unfollowCtrl = async (req, res, next) => {
  try {
    //1. Find a User to unfollow
    const userToBeUnfollowed = await User.findById(req.params.id);

    //2. Find the user who wants to unfollow another user
    const userWhoUnfollowed = await User.findById(req.userAuth);

    //3. Check if user to follow and user who followed are found
    if (userToBeUnfollowed && userWhoUnfollowed) {
      // check if user whofollowed is already in the user to follow array
      const isUserAlreadyfollowed = userToBeUnfollowed.followers.find((follower) => follower.toString() === userWhoUnfollowed._id.toString());
      if (!isUserAlreadyfollowed) {
        return next(appErr("You have not followed this user"));
      } else {
        //5. Remove user who unfollowed from the user's follower array
        userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
          (follower) => follower._id.toString() !== userWhoUnfollowed._id.toString()
        );
        //6. save
        await userToBeUnfollowed.save();
        //7. Remove userToBeUnfollowed from the userWhoUnfollowed's following array
        userWhoUnfollowed.following = userToBeUnfollowed.followers.filter(
          (follower) => follower._id.toString() !== userToBeUnfollowed._id.toString()
        );
        await userWhoUnfollowed.save();
        res.json({
          status: "Success",
          data: "You have Successfully unfollowed this user",
        });
      }
    }
  } catch (error) {
    res.json(error.message);
  }
};

// BLOCK A USER'S CONTROLLER
const blockCtrl = async (req, res, next) => {
  try {
    //1. Find a User to unfollow
    const userToBeBlocked = await User.findById(req.params.id);

    //2. Find the user who wants to unfollow another user
    const userWhoBlocked = await User.findById(req.userAuth);

    //3. Check if user to be blocked and user who blocked are found
    if (userToBeBlocked && userWhoBlocked) {
      // check if user who blocked is already in the user to blocked array
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find((blocked) => blocked.toString() === userToBeBlocked._id.toString());
      if (isUserAlreadyBlocked) {
        return next(appErr("You have already blocked this user"));
      } else {
        //5. push user who to block to the user whoBlocked blocked's array
        userWhoBlocked.blocked.push(userToBeBlocked._id);
        //6. save
        await userWhoBlocked.save();
        res.json({
          status: "Success",
          data: "You have Successfully blocked this user",
        });
      }
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

// UNBLOCK A USER'S CONTROLLER
const unblockCtrl = async (req, res, next) => {
  try {
    //1. Find a User to unblock
    const userToBeUnblocked = await User.findById(req.params.id);

    //2. Find the user who wants to unblock another user
    const userWhoUnblocked = await User.findById(req.userAuth);

    //3. Check if user to be blocked and user who blocked are found
    if (userToBeUnblocked && userWhoUnblocked) {
      // check if user who blocked is already in the user to blocked array
      const isUserAlreadyBlocked = userWhoUnblocked.blocked.find((blocked) => blocked.toString() === userToBeUnblocked._id.toString());
      if (!isUserAlreadyBlocked) {
        return next(appErr("You have not blocked this user"));
      } else {
        userWhoUnblocked.blocked = userWhoUnblocked.blocked.filter((blocked) => blocked.toString() !== userToBeUnblocked._id.toString());
        //6. save
        await userWhoUnblocked.save();
      }
      res.json({
        status: "Success",
        data: "You have Unblocked this user",
      });
    }
  } catch (error) {
    return next(appErr(error.message));
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

// USER DELETE ACCOUNT CONTROLLER
const deleteAccountCtrl = async (req, res, next) => {
  try {
    //1. find the user to be deleted
    const userToDelete = await User.findById(req.userAuth);
    //2. Delete all posts created by this user
    await Post.deleteMany({ user: req.userAuth });
    //3. Delete all comment created by this user
    await Comment.deleteMany({ user: req.userAuth });
    //4. Delete all category created by this user
    await Category.deleteMany({ user: req.userAuth });
    //5. Delete the user account
    await userToDelete.deleteOne();
    return res.json({
      status: "Success",
      data: "Account deleted successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// EXPORT ALL MODULES
module.exports = {
  deleteAccountCtrl,
  userProfileCtrl,
  userRegisterCtrl,
  userLoginCtrl,
  usersCtrl,
  profilePhotoUploadCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  unfollowCtrl,
  blockCtrl,
  unblockCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updateUserProfileCtrl,
  updateUserPasswordCtrl,
};
