const express = require("express");
const router = express.Router();
const passport = require("passport"); // TO USE PROTECED ROUTES
const User = require("../models/User");
const Class = require("../models/Class");
const {isConnected, isAdmin} = require('../src/middlewares')

// L O G I N
router.get("/login", (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

// A D M I N   P A G E

router.get("/admin", isConnected, isAdmin, (req, res, next) => {
  // Find all users & classes
  Promise.all([User.find(), Class.find()])
  .then(values => {
    res.render("auth/admin", { users: values[0], classes: values[1], message: req.flash("error") });
  })
  .catch(err => console.log(err));
});

// L O G O U T
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
