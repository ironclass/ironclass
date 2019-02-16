const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary');
const uploadCloud = require('../config/cloudinary.js');
const {addTeacherToClass, removeTeacherfromClass, addTAToClass, removeTAfromClass }  = require("../src/helpers");
const User = require("../models/User");
const Class = require("../models/Class");
const {
  isConnected,
  isTA
} = require("../src/middlewares");

// ###########
// C R E A T E
// ########### 

// ------ C r e a t e   S t u d e n t s  ------

router.post("/createUser/:classId", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
  // configure Cloudinary

  let imgPath, imgName;
  if (req.file) {
    imgPath = req.file.url;
    imgName = req.file.originalname;
  } else {
    imgPath = "https://www.axiumradonmitigations.com/wp-content/uploads/2015/01/icon-user-default.png";
    imgName = "default";
  }

  // get ID of current Class
  const classId = req.params.classId;

  // get Data from form
  const { firstName, lastName, birthday, role } = req.body;
  let username = (firstName + lastName).replace(/\s/g,'').toLowerCase();

  let classPassword;

  // data validation and after success: user creation
  if (firstName === "" || lastName === "") {
    req.flash("error", "Indicate full name");
    res.redirect("/classes/edit/" + classId);
    return;
  }

  // check if user alread exists
  User.findOne({
    username
    }, (err, user) => {
      if (user !== null) {
        console.log(username + " alread exists!");
        req.flash("error", "This User already exists");
        res.redirect("/classes/edit/" + classId);
        return;
      }
    })
    .then(() => {
      // if user does not exist, find the current Class-Password
      Class.findById(classId)
        .then(oneClass => {
          classPassword = oneClass.password;
        })
        .then(() => {
          // Create user
          User.create({
              firstName,
              lastName,
              username,
              birthday,
              role,
              imgName,
              imgUrl: imgPath,
              password: classPassword,
              _class: classId
            })
            .then((createdUser) => {
              if (createdUser.role === "Teacher") addTeacherToClass(classId, createdUser._id);
              else if (createdUser.role === "TA") addTAToClass(classId, createdUser._id);
            })
            .then(() => {
              req.flash("success", "New User added");
              res.redirect("/classes/edit/" + classId);
            })
            .catch(err => console.log(err)); // End find Class
        })
        .catch(err => console.log(err)); // End find user
    });
});

// ###########
//   E D I T
// ###########

// ------ E d i t  S t u d e n t  ------
router.get("/user/edit/:id", isConnected, isTA, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      let birthday;
      if (user.birthday !== null) {
        birthday = user.birthday.toISOString().substr(0, 10);
      } else {
        birthday = new Date().toISOString().substr(0, 10);
      }
      res.render("classes/editstudent", {
        user,
        birthday
      });
    })
    .catch(err => console.log(err));
});

router.post("/user/edit/:id", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
  const {
    firstName,
    lastName,
    birthday,
    role
  } = req.body;
  backURL = req.header('Referer') || '/';

  // configure Cloudinary
  let imgPath, imgName;
  if (req.file) {
    imgPath = req.file.url;
    imgName = req.file.originalname;
  } else {
    imgPath = "https://www.axiumradonmitigations.com/wp-content/uploads/2015/01/icon-user-default.png";
    imgName = "default";
  }

  // data validation and after success: user update
  if (firstName === "" || lastName === "" || birthday === null || birthday === "") {
    
    User.findById(req.params.id)
    .then(user => {
      let birthday;
      if (user.birthday !== null) {
        birthday = user.birthday.toISOString().substr(0, 10);
      } else {
        birthday = new Date().toISOString().substr(0, 10);
      }
      res.render("classes/editstudent", {
        user,
        birthday,
        error: "Indicate full name and birthday"
      });
      return;
    }) .catch(err => console.log(err));

  } else {
    let username = (firstName + lastName).replace(/\s/g,'').toLowerCase(); // remove all blank spaces from username
    let newUserObj = {
      firstName,
      lastName,
      birthday,
      role,
      username,
      imgUrl: imgPath,
      imgName
    };

    User.findById(req.params.id)
    .then(user => {
      // check if Username has changed at all
      if (user.username !== username) {
        //if changed, check if it alread exists in DB
        User.findOne({
          username
        })
        .then (user => {
          if (user !== null) {
            req.flash("error", "The User already exists");
            res.redirect("/users/user/edit/" + req.params.id);
            return;
          } 
        }).catch(err => console.log(err));
      } 

    updateUser(req.params.id, newUserObj, res);
      
    }).catch(err => console.log(err));
    
    
  }
});
//TODO: Create a function

function updateUser(userId, newUserObj, res) {
  User.findById(userId)
  .then ((user) => {
    let oldRole = user.role;
    User.findByIdAndUpdate(userId, newUserObj)
    .then(() => {
      User.findById(userId)
      .then(user => {
        if (oldRole === "TA" && user.role !== "TA") {
          removeTAfromClass (user._class, user._id);
          if (user.role === "Teacher") addTeacherToClass (user._class, user._id);
        } else if (oldRole === "Teacher" && user.role !== "Teacher") {
          removeTeacherfromClass (user._class);
          if (user.role === "TA") addTAToClass (user._class, user._id);
        } else {
          if (user.role === "Teacher") {
            addTeacherToClass (user._class, user._id);
          } else if (user.role === "TA") addTAToClass (user._class, user._id);
        }
      }).catch(err => console.log(err));
    })
    .then(user => {
      res.redirect(backURL);
    }).catch(err => console.log("Creation error: "+err));
  }).catch(err => console.log(err));
}

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