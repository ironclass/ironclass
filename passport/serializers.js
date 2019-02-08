// DEFINE THE SERIALIZATION THAT IS USED, TO KEEP THE AMOUNT OF DATA IN THE SESSION AS SMALL AS POSSIBLE/NEEDED
const passport = require("passport");
const User = require("../models/User");

passport.serializeUser((loggedInUser, cb) => {
  cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
  User.findById(userIdFromSession)
    .then(userDocument => {
      cb(null, userDocument);
    })
    .catch(err => {
      cb(err);
    });
});
