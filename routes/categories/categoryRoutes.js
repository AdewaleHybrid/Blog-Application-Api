const express = require("express");
const categoryRouter = express.Router();

const {
  categoryCreateCtrl,
  fetchCategoriesCtrl,
  fetchOneCategoryCtrl,
  categoryDeleteCtrl,
  categoryUpdateCtrl,
} = require("../../controllers/categories/categoryCtrl");
const isLogin = require("../../middlewares/isLogin");

// Create A Category
// http://localhost:9000/api/v1/categories
categoryRouter.post("/create-category", isLogin, categoryCreateCtrl);

// Get A Single Category
// http://localhost:1200/api/v1/categories/:id
categoryRouter.get("/:id", fetchOneCategoryCtrl);

// Get All categories
// http://localhost:1200/api/v1/categories
categoryRouter.get("/", fetchCategoriesCtrl);

// Update A Category
// http://localhost:1200/api/v1/categories/:id
categoryRouter.put("/:id", isLogin, categoryUpdateCtrl);

// Delete A Category
// http://localhost:1200/api/v1/categories/:id
categoryRouter.delete("/:id", isLogin, categoryDeleteCtrl);

// EXPORTS
module.exports = categoryRouter;
