const Admin = require("../model/Admin/Admin");
const User = require("../model/User/User");
const appErr = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isAdmin = async (req, res, next) => {
  // get token from header
  const token = getTokenFromHeader(req);
  // Verify the token
  const decodedUser = verifyToken(token);
  // save the user into the req object
  req.userAuth = decodedUser.id;
  // find the user in DB
  const admin = await Admin.findById(decodedUser.id);
  // Check if the user is an Admin
  if (admin.isAdmin) {
    return next();
  } else {
    return next(appErr("Access Denied, Admin Only", 403));
  }
};

module.exports = isAdmin;
