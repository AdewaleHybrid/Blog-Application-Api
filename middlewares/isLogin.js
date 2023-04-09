const appErr = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isLogin = (req, res, next) => {
  // get token from header
  const token = getTokenFromHeader(req);
  // Verify the token
  const decodedUser = verifyToken(token);
  // save the user into the req object
  req.userAuth = decodedUser.id;
  if (!decodedUser) {
    return next(appErr("Invalid/Expired Token, Please login again", 500));
  } else {
    // return res.json({ success: "Success" });
    next();
  }
};

module.exports = isLogin;
