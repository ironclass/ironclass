const express = require("express");
const passport = require("passport"); // TO USE PROTECED ROUTES
const bcrypt = require("bcryptjs"); // TO USE ENCRYPTION FOR PASSWORD
const User = require("../models/User");


const router = express.Router();
const bcryptSalt = 10;

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

// L O G O U T
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
