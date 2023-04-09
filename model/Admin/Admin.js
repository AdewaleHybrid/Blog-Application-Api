const mongoose = require("mongoose");
const Post = require("../Post/Post");
const User = require("../User/User");

// Create User Schema
const adminSchema = new mongoose.Schema(
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
      default: true,
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

// Compile the Admin model
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
