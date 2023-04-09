// APP ERROR
const appErr = (message, statusCode) => {
  let error = new Error(message);
  error.statusCode = error.statusCode ? error.statusCode : 500;
  error.stack = error.stack;
  return error;
};

module.exports = appErr;
