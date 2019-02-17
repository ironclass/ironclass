const express = require("express");
const router = express.Router();
const uploadCloud = require('../config/cloudinary.js');
const { setImageData, setBirthday }  = require("../src/helpers");
const { createNewUserInClass, updateUser }  = require("../src/userhelpers");
const User = require("../models/User");
const Class = require("../models/Class");
const { isConnected, isTA } = require("../src/middlewares");

// ###########
// C R E A T E
// ########### 

// ------ C r e a t e   S t u d e n t s  ------

router.post("/createUser/:classId", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
  backURL = req.header('Referer') || '/';

  // get Data from form and URL
  const { firstName, lastName, birthday, role } = req.body;
  const classId = req.params.classId;
  const img = setImageData(req);  // Cloudinary

  // data validation and after success: user creation
  if (firstName === "" || lastName === "") {
    req.flash("error", "Indicate full name");
    res.redirect(backURL);
    return;
  }
  // check if user alread exists
  let username = (firstName + lastName).replace(/\s/g,'').toLowerCase();
  User.findOne({username})
  .then((user) => {
    if (user !== null) {
      req.flash("error", "This User already exists");
      res.redirect(backURL);
    } else {
      Class.findById(classId)
      .then(oneClass => {
        let newUserObj = { firstName, lastName, birthday, role, username, 
          imgUrl: img.url, 
          imgName: img.name, 
          password: oneClass.password,
          _class: classId 
        };
        createNewUserInClass (newUserObj, classId, req, res, backURL);
      }).catch(err => console.log(err));
    }
  });
});

// ###########
//   E D I T
// ###########

// ------ E d i t  S t u d e n t  ------
router.get("/user/edit/:id", isConnected, isTA, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      let birthday = setBirthday(user); // if null, set empty to render correctly with hbs
      res.render("classes/editstudent", { user, birthday });
    }).catch(err => console.log(err));
});

router.post("/user/edit/:id", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
  backURL = req.header('Referer') || '/';

  // get Data from form and URL
  const { firstName, lastName, birthday, role } = req.body;
  const userId = req.params.id;
  const img = setImageData(req);  // Cloudinary

  // data validation and after success: user update
  if (firstName === "" || lastName === "") {
    
    User.findById(userId)
    .then(user => {
      req.flash("error", "Indicate full name and birthday");
      res.redirect(backURL);
      return;
    }) .catch(err => console.log(err));

  } else {
    let username = (firstName + lastName).replace(/\s/g,'').toLowerCase(); // remove all blank spaces from username
    let newUserObj = { firstName, lastName, birthday, role, username, imgUrl: img.url, imgName: img.name };

    User.findById(userId)
    .then(user => {
      // if username hast changed, check if new username alread exists
      if (user.username !== username) {
        User.findOne({username})
        .then (user => {
          if (user !== null) {
            req.flash("error", "This User already exists");
            res.redirect(backURL);
          } else updateUser(userId, newUserObj, res);
        }).catch(err => console.log(err));
      } else updateUser(userId, newUserObj, res);
    }).catch(err => console.log(err));
  }
});

// ###########
// D E L E T E
// ###########

// ------ D e l e t e   S t u d e n t s  ------
router.get("/delete/user/:id", isConnected, isTA, (req, res, next) => {
  backURL = req.header("Referer") || "/";
  User.findByIdAndDelete(req.params.id)
    .then(() => res.redirect(backURL))
    .catch(err => {
      console.log(err);
      next();
    });
});

module.exports = router;