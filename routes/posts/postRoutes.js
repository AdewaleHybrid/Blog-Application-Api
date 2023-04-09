const express = require("express");
const postRouter = express.Router();
const isLogin = require("../../middlewares/isLogin");

const {
  postCreateCtrl,
  postsCtrl,
  postCtrl,
  postDeleteCtrl,
  postUpdateCtrl,
  toggleLikePostCtrl,
  toggleDisLikePostCtrl,
} = require("../../controllers/posts/postCtrl");
const multer = require("multer");
const storage = require("../../config/cloudinary");

const upload = multer({ storage });

// POST: Create A Post
// http://localhost:1200/api/v1/posts
postRouter.post("/create-post", isLogin, upload.single("photo"), postCreateCtrl);

// GET: Get A Single Post
// http://localhost:1200/api/v1/posts/:id
postRouter.get("/:id", isLogin, postCtrl);

// GET: Get All Posts
// http://localhost:1200/api/v1/posts
postRouter.get("/", isLogin, postsCtrl);

// PUT: Update A Post
// http://localhost:1200/api/v1/posts/edit-post/:id
postRouter.put("/edit-post/:id", isLogin, upload.single("photo"), postUpdateCtrl);

// GET: Lke A Post
// http://localhost:1200/api/v1/posts/:id
postRouter.get("/likes/:id", isLogin, toggleLikePostCtrl);

// GET: Dislike A Post
// http://localhost:1200/api/v1/posts/:id
postRouter.get("/dislikes/:id", isLogin, toggleDisLikePostCtrl);

// DELETE: Delete A Post
// http://localhost:1200/api/v1/posts/:id
postRouter.delete("/delete-post/:id", isLogin, postDeleteCtrl);

// EXPORTS
module.exports = postRouter;
