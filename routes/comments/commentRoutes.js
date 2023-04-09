const express = require("express");
const commentRouter = express.Router();
const isLogin = require("../../middlewares/isLogin");

const { commentCreateCtrl, commentDeleteCtrl, commentUpdateCtrl } = require("../../controllers/comments/commentCtrl");

// Create A Comment
// http://localhost:1200/api/v1/comments/{postId}
commentRouter.post("/:id", isLogin, commentCreateCtrl);

// Update A Comment
// http://localhost:1200/api/v1/comments/:id
commentRouter.put("/:id", isLogin, commentUpdateCtrl);

// Delete A Comment
// http://localhost:1200/api/v1/comments/:id
commentRouter.delete("/:id", isLogin, commentDeleteCtrl);

// EXPORTS
module.exports = commentRouter;
