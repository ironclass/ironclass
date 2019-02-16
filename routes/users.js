const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary');
const uploadCloud = require('../config/cloudinary.js');
const {addTeacherToClass, addTAToClass, setImageData }  = require("../src/helpers");
const User = require("../models/User");
const Class = require("../models/Class");
const { isConnected, isTA } = require("../src/middlewares");

// ###########
// C R E A T E
// ########### 

// ------ C r e a t e   S t u d e n t s  ------

router.post("/createUser/:classId", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
  backURL = req.header('Referer') || '/';

  // configure Cloudinary
  let img = setImageData(req);

  // get ID of current Class
  const classId = req.params.classId;

  // get Data from form
  const { firstName, lastName, birthday, role } = req.body;

  // data validation and after success: user creation
  if (firstName === "" || lastName === "") {
    req.flash("error", "Indicate full name");
    res.redirect(backURL);
    return;
  }

  // check if user alread exists
  let username = (firstName + lastName).replace(/\s/g,'').toLowerCase();
  User.findOne({username})
  .then((user) => User.checkIfUserExists(user, backURL, req, res))
    // if user does not exist, find the current Class-Password and create User
  .then(() => {
      let newUserObj = { firstName, lastName, birthday, role, username, 
        imgUrl: img.url, 
        imgName: img.name, 
        password: getClassPassword(classId),
        _class: classId 
      };
      User.createNewUserInClass (newUserObj, classId, req, res, backURL);
  });
});

function getClassPassword(classId) {
  Class.findById(classId)
  .then(oneClass => {return oneClass.password;})
  .catch(err => console.log(err));
}

// ###########
//   E D I T
// ###########

// ------ E d i t  S t u d e n t  ------
router.get("/user/edit/:id", isConnected, isTA, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      let birthday = User.setBirthday(user);
      res.render("classes/editstudent", { user, birthday });
    }).catch(err => console.log(err));
});

router.post("/user/edit/:id", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
  const { firstName, lastName, birthday, role } = req.body;
  backURL = req.header('Referer') || '/';

  // configure Cloudinary
  let img = setImageData(req);

  // data validation and after success: user update
  if (firstName === "" || lastName === "" || birthday === null || birthday === "") {
    
    User.findById(req.params.id)
    .then(user => {
      let birthday = User.setBirthday(user);
      req.flash("error", "Indicate full name and birthday");
      res.render("classes/editstudent", { user, birthday });
      return;
    }) .catch(err => console.log(err));

  } else {
    let username = (firstName + lastName).replace(/\s/g,'').toLowerCase(); // remove all blank spaces from username
    let newUserObj = { firstName, lastName, birthday, role, username, imgUrl: img.url, imgName: img.name };

    User.findById(req.params.id)
    .then(user => {
      // if username hast changed, check if new username alread exists
      if (user.username !== username) {
        User.findOne({username})
        .then (user => User.checkIfUserExists(user, backURL, req, res))
        .catch(err => console.log(err));
      } 
      User.updateUser(req.params.id, newUserObj, res);
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
    .then(() => {
      res.redirect(backURL);
    })
    .catch(err => {
      console.log(err);
      next();
    });
});

module.exports = router;