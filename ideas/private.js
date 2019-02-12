const express = require("express");
const User = require("../models/User");
const { isConnected, checkRole } = require("../src/middlewares");

const router = express.Router();

router.get("/secret", isConnected, (req, res, next) => {
  let user = req.user;
  res.render("private/secret", { user });
});

router.get("/user/all", isConnected, (req, res, next) => {
  User.find()
    .then(user => {
      res.render("private/user/all", { user });
    })
    .catch(next);
});

// USER PAGE
router.get("/user/page", isConnected, (req, res, next) => {
  let user = req.user;
  res.render("private/user/page", { user });
});
router.get("/user/page/:id", isConnected, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      // console.log("TCL: user", user);
      res.render("private/user/page", { user });
    })
    .catch(next);
});

// EDIT USER
router.get("/user/edit", isConnected, (req, res, next) => {
  let user = req.user;
  res.render("private/user/edit", { user });
});
router.post("/user/edit", (req, res, next) => {
  const { _id, username, password } = req.body;
  User.findByIdAndUpdate(_id, { username, password })
    // .then(() => res.redirect("./page")) // private/user/page
    // .then(() => res.redirect("user/page")) // /private/user/user/page
    .then(() => res.redirect("/private/user/page")) // // /user/page
});

// DELETE USER
/*****************************************************
 *** do i need a checkRole("Boss") middleware here? ***
 *****************************************************/
router.get("/user/delete/:id", isConnected, (req, res, next) => {
  console.log("Hi");
  console.log(req.params.id);
  User.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/private/user/all"))
    .catch(next);
});

module.exports = router;
