// DEFINITION OF MIDDLEWARES TO USE IN app.js
module.exports = {
  isConnected: function(req, res, next) {
    // if connected, express defines a req.user
    if (req.user) {
      next();
    } else {
      res.redirect("/auth/login");
    }
  },
  checkRole: function(role) {
    return function(req, res, next) {
      let backURL=req.header('Referer') || '/';
      if (req.user && (req.user.role === role || req.user.admin === true)) {
        next();
      } else {
        res.redirect(backURL);
      }
    };
  }
};
