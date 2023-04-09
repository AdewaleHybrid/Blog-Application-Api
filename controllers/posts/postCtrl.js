const User = require("../../model/User/User"); // User model
const Post = require("../../model/Post/Post"); // Post Model
const appErr = require("../../utils/appErr"); // Application Error

// POST CREATE CONTROLLER
const postCreateCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    // Find the author/user
    const author = await User.findById(req.userAuth);
    // check if the author is blocked
    if (author.isBlocked) {
      next(appErr("Access Denied!, Account has been blocked", 403));
    }
    // Create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: author._id,
      photo: req?.file?.path,
    });
    // Associate user with the post: Push the post to the user posts field
    author.posts.push(postCreated);
    // Save
    await author.save();
    res.json({
      status: "Success",
      data: postCreated,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// ALL POSTS CONTROLLER
const postsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("user");
    // check if the logged in user is being blocked by the post owner
    const filteredPosts = posts.filter((post) => {
      const blockedUsers = post.user.blocked;
      const isBlocked = blockedUsers.includes(req.userAuth);
      // console.log(isBlocked);
      // console.log(post.title);
      return isBlocked ? null : post;
    });
    res.json({
      status: "Success",
      data: filteredPosts,
      // {
      //   title: filteredPosts.title,
      //   description: filteredPosts.description,
      //   category: filteredPosts.category,
      //   viewers: filteredPosts.viewers,
      //   likes: filteredPosts.likedBy,
      //   dislikes: filteredPosts.DisLikedBy,
      //   posted: filteredPosts.daysAgo,
      // },
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// GET A SINGLE POST CONTROLLER
const postCtrl = async (req, res, next) => {
  try {
    //1. find the post
    const post = await Post.findById(req.params.id);
    if (!post) {
      next(appErr("Post not found"));
    }
    const isviewed = post.viewers.includes(req.userAuth);

    if (isviewed) {
      // const numbersOfViewers = post.numViews.map((viewer) => viewer).length;
      res.json({
        status: "Success",
        data: post,
      });
    } else {
      post.viewers.push(req.userAuth);
      await post.save();
      res.json({
        status: "Success",
        data: post,
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// TOGGLE LIKE CONTROLLER
const toggleLikePostCtrl = async (req, res, next) => {
  try {
    //1. Get the post
    const postId = req.params.id;
    const post = await Post.findById(postId);
    //2. check if the user has already liked this post
    const user = req.userAuth;
    const isLiked = post.likedBy.includes(user);
    if (isLiked) {
      post.likedBy = post.likedBy.filter((like) => like.toString() !== user.toString());
      await post.save();
    } else {
      post.likedBy.push(user);
      await post.save();
    }
    res.json({
      status: "Success",
      data: post,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// TOGGLE DISLIKE CONTROLLER
const toggleDisLikePostCtrl = async (req, res, next) => {
  try {
    //1. Get the post
    const postId = req.params.id;
    const post = await Post.findById(postId);
    //2. check if the user has already unliked this post
    const user = req.userAuth;
    const isDisliked = post.DisLikedBy.includes(user);
    if (isDisliked) {
      post.disLikes = post.DisLikedBy.filter((disLike) => disLike.toString() !== user.toString());
      await post.save();
    } else {
      post.DisLikedBy.push(user);
      await post.save();
    }
    res.json({
      status: "Success",
      data: post,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// POST DELETE CONTROLLER
const postDeleteCtrl = async (req, res, next) => {
  try {
    //1. Find the post to delete
    const postToDelete = await Post.findById(req.params.id);
    //2. find the logged in user
    const user = req.userAuth;
    const loggedInUser = await User.findById(user);
    if (!postToDelete) {
      return next(appErr("Post not found"));
    }
    if (postToDelete.user.toString() !== user.toString()) {
      return next(appErr("Access denied, You are not allowed to delete this post", 403));
    }
    await Post.findByIdAndDelete(postToDelete);
    // Delete post from user's post array
    await User.findByIdAndUpdate(
      user,
      {
        $pull: { posts: postToDelete._id },
      },
      { new: true }
    );
    return res.json({
      status: "Success",
      data: "Post deleted successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// POST UPDATE CONTROLLER
const postUpdateCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    //find the post
    const post = await Post.findById(req.params.id);
    // check if post belongs to the user
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appErr("Access denied, You are not allowed to update this post", 403));
    }
    const updatedPost = await Post.findByIdAndUpdate(
      post,
      {
        title,
        description,
        category,
        photo: req?.file?.path,
      },
      { new: true, runValidation: true }
    );
    await post.save();
    res.json({
      status: "Post Updated",
      data: updatedPost,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// EXPORT ALL MODULES
module.exports = {
  postCreateCtrl,
  postsCtrl,
  postCtrl,
  postDeleteCtrl,
  postUpdateCtrl,
  toggleLikePostCtrl,
  toggleDisLikePostCtrl,
};
