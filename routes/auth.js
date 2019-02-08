const express = require("express");
const passport = require("passport"); // TO USE PROTECED ROUTES
const bcrypt = require("bcryptjs"); // TO USE ENCRYPTION FOR PASSWORD
const User = require("../models/User");


const router = express.Router();
const bcryptSalt = 10;

// LOGIN
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

// SIGNUP
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});
router.post("/signup", (req, res, next) => {
  const { username, password, role } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS USER CREATION
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
      role
    });

    newUser
      .save()
      .then(() => {
        res.redirect("/private/user/all");
      })
      .catch(err => {
        res.render("auth/signup", { message: "Something went wrong" });
      });
  });
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
