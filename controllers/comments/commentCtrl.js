const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr"); // Application Error

// POST CREATE CONTROLLER
const commentCreateCtrl = async (req, res, next) => {
  const { description } = req.body;
  try {
    //1. find the post to comment on
    const post = await Post.findById(req.params.id);
    //2. find the users
    const user = await User.findById(req.userAuth);
    //3. create the comment
    const comment = await Comment.create({ post: post._id, user: req.userAuth, description });
    //4. push comment to the post
    post.comments.push(comment);
    // save
    // Disable validationBeforeSave;
    await post.save({ validateBeforeSave: false });
    res.json({
      status: "Success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

// POST DELETE CONTROLLER
const commentDeleteCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    //1. find the comment you want to delete
    // find the post
    if (!comment) {
      next(appErr("Comment not found", 404));
    }
    if (comment.user.toString() !== req.userAuth.toString()) {
      next(appErr("access denied, You cannot delete this comment", 500));
    }
    // =====  Delete comment from post's comment array =====
    //1. Find the post from the comment
    const post = await Post.findById(comment.post.toString());
    //2. Grab the commentId from the comment
    const commentId = comment._id.toString();
    //3. Remove commentId from post's comments array
    await Post.findByIdAndUpdate(
      post,
      {
        $pull: { comments: commentId },
      },
      { new: true }
    );
    await Comment.findByIdAndDelete(comment);
    res.json({
      status: "Succes",
      data: "Comment Delete Successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// USER UPDATE CONTROLLER
const commentUpdateCtrl = async (req, res, next) => {
  const { description } = req.body;
  try {
    //1. find the comment you want to update
    const commentToUpdate = await Comment.findById(req.params.id);
    if (commentToUpdate.user.toString() !== req.userAuth.toString()) {
      next(appErr("access denied, You cannot update this comment", 500));
    }
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json({
      status: "Success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

// EXPORT ALL MODULES
module.exports = {
  commentCreateCtrl,
  commentDeleteCtrl,
  commentUpdateCtrl,
};
