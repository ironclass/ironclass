// DEFINE THE STRATEGY, IN THIS CASE LocalStrategy
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // TYPE OF THE STRATEGY
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// SETUP THE MIDDLEWARE FOR THE SELECTED STRATEGY
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    (username, password, done) => {
      User.findOne({ username })
        .then(foundUser => {
          if (!foundUser) {
            done(null, false, { message: "Incorrect username" });
            return;
          }

          if (!bcrypt.compareSync(password, foundUser.password)) {
            done(null, false, { message: "Incorrect password" });
            return;
          }

          done(null, foundUser);
        })
        .catch(err => done(err));
    }
  )
);
