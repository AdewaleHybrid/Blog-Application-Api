const getTokenFromHeader = (req) => {
  // Get Token From Header
  const headerObj = req.headers;
  const token = headerObj["authorization"];
  // console.log(token);
  if (token !== undefined) {
    return token;
  } else {
    return {
      status: "Failed",
      message: "There is no token attached to the header",
    };
  }
};
module.exports = getTokenFromHeader;
