const express = require("express");
const app = express();
// const isAdmin = require("./middlewares/isAdmin");

// DOTENV CONFIGUTRATION
const dotenv = require("dotenv").config();
require("./config/dbConnect");

// ROUTRES MODULES
const adminRouter = require("./routes/admins/adminRoutes");
const userRouter = require("./routes/users/userRoutes");
const postRouter = require("./routes/posts/postRoutes");
const categoryRouter = require("./routes/categories/categoryRoutes");
const commentRouter = require("./routes/comments/commentRoutes");

// IsAdmin Middleware

// Error handler middleware
const globalErrHandler = require("./middlewares/globalErrHandler");

// Middleware configuration
app.use(express.json()); // Pass Incoming Json Data.

// ROUTES MIDDLEWARE -------
app.use("/api/v1/admins/", adminRouter); // ADMIN ROUTES
app.use("/api/v1/users/", userRouter); // USERS ROUTES
app.use("/api/v1/posts/", postRouter); // POSTS ROUTES
app.use("/api/v1/categories/", categoryRouter); // CATEORIES ROUTES
app.use("/api/v1/comments/", commentRouter); // COMMENTS ROUTES
// app.use(isAdmin);
// Error handlers
app.use(globalErrHandler);

// 404 Error Handler
app.use("*", (req, res) => {
  res.status(404).json({ message: `${req.originalUrl} -Route Not Found` });
});

//LISTEN TO SERVER
const port = process.env.PORT || 1200;
app.listen(port, (req, res) => {
  console.log(`server is running on http://localhost:${port}`);
});
