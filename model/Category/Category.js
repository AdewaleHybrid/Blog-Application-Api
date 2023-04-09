const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compile the Category model
const Category = mongoose.model("Category", categorySchema);

// Export the model
module.exports = Category;
