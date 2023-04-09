const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
    user: {
      type: Object,
      required: [true, "Post is required"],
    },

    description: {
      type: String,
      required: [true, "Comment is required "],
    },
  },
  {
    timestamps: true,
  }
);

// Compile the Comment model
const Comment = mongoose.model("Comment", commentSchema);

// Export the model
module.exports = Comment;
