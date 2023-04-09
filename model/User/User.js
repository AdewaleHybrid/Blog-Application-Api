const mongoose = require("mongoose");
const Post = require("../Post/Post");

// Create User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      required: [true, "First Name is required"],
      type: String,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    profilePhoto: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Passwrod Name is required"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // active: {
    //   type: Boolean,
    //   default: true,
    // },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // plan: {
    //   type: String,
    //   enum: ["Free", "Premium", "Pro"],
    //   default: "Free",
    // },

    userAward: [
      {
        type: String,
        enum: ["Bronze", "Silver", "Gold"],
        default: "Bronze",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // to get virtual in json format from server to client
  }
);

// Hooks
// pre - before record is saved
// Getting the last post date
userSchema.pre("findOne", async function (next) {
  // Populate posts
  this.populate({ path: "posts" });

  // get the user id
  const userId = this._conditions._id;
  // find tHe post created by the user
  const posts = await Post.find({ user: userId });
  // get the last post created by the user
  const lastPostCreated = posts[posts.length - 1];
  // get the last post date
  const lastPostDate = new Date(lastPostCreated && lastPostCreated.createdAt);
  // get the last post date as a string format
  const lastPostDateString = lastPostDate.toDateString();
  // console.log(lastPostDateString);

  // vitualize it on the user profile:
  userSchema.virtual("lastPostDate").get(function () {
    return lastPostDateString;
  });
  // ---------------- check if the user is inactive for 3days -----------------
  //1. get current date
  const currentDate = new Date();
  //2. get the diffrent between the last post date and current date
  const diff = currentDate - lastPostDate;
  //3. get the diff in days and return less than in days
  const diffInDays = diff / (1000 * 3000 * 24);

  if (diffInDays > 365) {
    // add virtuals inActive to the  user schema
    userSchema.virtual("activeUser").get(function () {
      return false;
    });
    // find the user by Id and update
    await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
  } else {
    userSchema.virtual("activeUser").get(function () {
      return true;
    });
    await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
  }

  // -------------- last active date ------------------------------
  // conver to daysAgo
  const daysAgo = Math.floor(diffInDays);
  userSchema.virtual("lastActive").get(function () {
    if (daysAgo <= 0) {
      return "Today";
    }
    if (daysAgo === 1) {
      return "Yesterday";
    }
    if (daysAgo > 1) {
      return `${daysAgo} days ago`;
    }
  });

  // ------------- Upgrade User based on number of posts -------------
  const NumberOfPosts = posts.length;
  if (NumberOfPosts < 10) {
    await User.findByIdAndUpdate(userId, { userAward: "Bronze" }, { new: true });
  }
  if (NumberOfPosts >= 10) {
    await User.findByIdAndUpdate(userId, { userAward: "Silver" }, { new: true });
  }
  if (NumberOfPosts >= 20) {
    await User.findByIdAndUpdate(userId, { userAward: "Gold" }, { new: true });
  }

  next();
});

// post - after record is saved
userSchema.pre("save", function (next) {
  console.log("post hook called");
  next();
});

// Get FullName:
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Get Initials:
userSchema.virtual("initials").get(function () {
  return `${this.firstName[0]}${this.lastName[0]}`;
});

// Get Number of Post Created by the user :
userSchema.virtual("NumberOfPosts").get(function () {
  return this.posts.length;
});

// Get Number of Followers:
userSchema.virtual("NumberOfFollowers").get(function () {
  return this.followers.length;
});

// Get Number of Following:
userSchema.virtual("NumberOfFollowing").get(function () {
  return this.following.length;
});

// Get Number of Followers:
userSchema.virtual("NumberOfViewers").get(function () {
  return this.following.length;
});

// Get Number of Followers:
userSchema.virtual("NumberOfUserBlocked").get(function () {
  return this.blocked.length;
});

// Compile the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
