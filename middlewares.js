// DEFINITION OF MIDDLEWARES TO USE IN app.js
module.exports = {
  isConnected: function(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect("/auth/login");
    }
  },
  isTA: function(req, res, next) {
    if (req.user && res.locals.isTA) {
      next();
    } else {
      res.redirect("/");
    }
  },
};
