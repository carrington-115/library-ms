const csrf = require("csurf");

module.exports = (req, res, next) => {
  if (req.method === "GET") {
    return next();
  }
  return csrf()(req, res, next);
};
