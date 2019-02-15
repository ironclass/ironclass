// DEFINITION OF MIDDLEWARES TO USE IN app.js
module.exports = {
  isConnected: function(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect("/");
    }
  },
  isTA: function(req, res, next) {
    if (req.user && res.locals.isTA) {
      next();
    } else {
      res.redirect("/");
    }
  },
  isAdmin: function(req, res, next) {
    if (req.user && res.locals.isAdmin) {
      next();
    } else {
      res.redirect("/");
    }
  }
};
