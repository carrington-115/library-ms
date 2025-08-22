const csrf = require("csurf");

module.exports = (req, res, next) => {
  csrf();
  return next();
};
