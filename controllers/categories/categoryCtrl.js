const Category = require("../../model/Category/Category");
const appErr = require("../../utils/appErr"); // Application Error

// POST CREATE CONTROLLER
const categoryCreateCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.create({ title, user: req.userAuth });
    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// ALL CATEGORIES CONTROLLER
const fetchCategoriesCtrl = async (req, res, next) => {
  try {
    // Get all users
    const categories = await Category.find();
    res.json({
      status: "Success",
      data: categories,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// A SINGLE CATEGORY CONTROLLER
const fetchOneCategoryCtrl = async (req, res, next) => {
  try {
    // Get a category
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// CATEGORY DELETE CONTROLLER
const categoryDeleteCtrl = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    await Category.findByIdAndDelete(categoryId);
    res.json({
      status: "Success",
      data: "Category Deleted Successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// CATEGORY UPDATE CONTROLLER
const categoryUpdateCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const categoryId = req.params.id;
    const category = await Category.findByIdAndUpdate(categoryId, { title }, { new: true, runValidators: true });

    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// EXPORT ALL MODULES
module.exports = {
  categoryCreateCtrl,
  fetchCategoriesCtrl,
  fetchOneCategoryCtrl,
  categoryDeleteCtrl,
  categoryUpdateCtrl,
};
