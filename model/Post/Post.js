const mongoose = require("mongoose");

// Create Post Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post Title is required"],
      trim: true, // trim indicates no space between the charaters
    },
    description: {
      type: String,
      required: [true, "Post Description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      // required: [true, "Post Category is required"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    DisLikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is reqired"],
    },
    photo: {
      type: String,
      // required: [false, "Please, provide a photo to upload"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Hook
postSchema.pre(/^find/, function (next) {
  // =========== add viewscount to virtual field ============
  postSchema.virtual("Number of viewers").get(function () {
    const post = this;
    return post.viewers.length;
  });
  // =========== add number of likes to virtual field ============
  postSchema.virtual("Number Of Likes").get(function () {
    const post = this;
    return post.likedBy.length;
  });

  // =========== add number of Dislikes to virtual field ============
  postSchema.virtual("Number Of Likes").get(function () {
    const post = this;
    return post.DisLikedBy.length;
  });
  // // =========== add likes percentage to virtual field ============
  // postSchema.virtual("Likes percentage").get(function () {
  //   const post = this;
  //   const total = +post.likedBy.length + +post.DisLikedBy.length;
  //   const percentage = (post.likedBy.length / total) * 100;
  //   return `${percentage}%`;
  // });

  // =========== add Dislikes percentage to virtual field ============
  // postSchema.virtual("Dislikes percentage").get(function () {
  //   const post = this;
  //   const likedBy = post.likedBy.length;
  //   const dislikes = post.DisLikedBy.length;
  //   const total = likedBy + dislikes;
  //   const percentage = (dislikes / total) * 100;
  //   if (typeof percentage !== "number") {
  //     return "0 likes";
  //   }
  //   return `${percentage}%`;
  // });

  // if days is less than 0 return today,if day is equal to 1 return yesterday else return days ago
  postSchema.virtual("daysAgo").get(function () {
    const post = this;
    const date = new Date(post.createdAt);
    const dateToWholeNumber = Math.floor(date);
    const daysAgo = Math.floor((Date.now() - dateToWholeNumber) / 86400000);
    return daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}days ago`;
  });
  // DUPLICATE ID
  postSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });

  // =========== add the author to virtual field ============
  // postSchema.virtual("author").get(function () {
  //   const post = this;
  //   return post.user.id;
  // });
  next();
});

// Compile the Post model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
