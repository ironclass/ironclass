// TODO: Avoid double Names when editing
// TODO: Avoid clearing form, wen re-render page with error message
// TODO: check if password has changed, when editing
// TODO: Redirect with error messages?

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const uploadCloud = require('../config/cloudinary.js');
const passport = require("passport"); // TO USE PROTECED ROUTES
const User = require("../models/User");
const Class = require("../models/Class");
const {
  isConnected,
  isTA
} = require("../middlewares");
const bcryptRounds = 10;

// ###########
// C R E A T E
// ###########

router.get("/create", isConnected, isTA, (req, res, next) => {
  res.render("classes/create");
});

// ------ C r e a t e   C l a s s e s ------
router.post("/createclass", isConnected, isTA, (req, res, next) => {
  const {
    name,
    city,
    password
  } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS CLASS CREATION
  if (name === "" || city === "Choose city..." || password === "") {
    res.render("classes/create", {
      message: "Indicate name, city and password"
    });
    return;
  }

  Class.findOne({
    $and: [{
      name
    }, {
      city
    }]
  }, (err, oneClass) => {
    if (oneClass !== null) {
      console.log(oneClass.name + " already exists");
      res.render("classes/create", {
        message: "The Classname already exists"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptRounds);
    const hashPass = bcrypt.hashSync(password, salt);

    Class.create({
        name: name,
        city: city,
        password: hashPass
      })
      .then(newClass => {
        res.redirect("/classes/edit/" + newClass._id);
      })
      .catch(err => {
        res.render("classes/create", {
          message: "Something went wrong"
        });
      });
  });
});

// ------ C r e a t e   S t u d e n t s  ------
router.post("/createStudent/:classId", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
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
  const {
    firstName,
    lastName,
    birthday,
    role
  } = req.body;
  let username = (firstName + lastName).toLowerCase();

  let classPassword;

  // data validation and after success: user creation
  if (firstName === "") {
    req.flash("message", "Indicate first name");
    res.redirect("/classes/edit/" + classId);
    return;
  }

  // check if user alread exists
  User.findOne({
      username
    }, (err, user) => {
      if (user !== null) {
        console.log(username + " alread exists!");
        req.flash("message", "The User already exists");
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
              if (createdUser.role === "Teacher") {
                Class.findByIdAndUpdate(classId, {
                    _teacher: mongoose.Types.ObjectId(createdUser._id)
                  })
                  .catch(err => console.log(err));
              }
            })
            .then(user => {
              console.log("Created User: " + user);
              res.redirect("/classes/edit/" + classId);
            })
            .catch(err => console.log(err)); // End find Class
        })
        .catch(err => console.log(err)); // End find user
    });
});

// ###########
//   S H O W
// ###########

router.get("/", isConnected, isTA, (req, res, next) => {
  Class.find()
    .populate("_teacher")
    .populate("_TA")
    .then(classes => {
      res.render("classes/show", {
        classes
      });
    })
    .catch(err => console.log(err));
});

// ###########
//   E D I T
// ###########

// ------ E d i t  C l a s s e s  ------
router.get("/edit/:id", isConnected, isTA, (req, res, next) => {
  // find current Class and all students in it
  Promise.all([
      Class.findById(req.params.id),
      User.find({
        _class: mongoose.Types.ObjectId(req.params.id)
      })
    ])
    .then(values => {
      res.render("classes/edit", {
        message: req.flash("message"),
        oneClass: values[0], // the class with this ID
        students: values[1] // all students in it
      });
    })
    .catch(err => console.log(err));
});

router.post("/edit/:id", isConnected, isTA, (req, res, next) => {
  // get ID of current Class
  const classId = req.params.id;

  // get Info from Post-Body
  const {
    name,
    city,
    password
  } = req.body;

  // check if minimum credentials are provided
  if (name === "" || city === "Choose city...") {
    res.render("classes/edit", {
      message: "Indicate name and city"
    });
    return;
  }

  // get Name of current Class
  Class.findById(classId)
    .then(oneClass => {
      // If the Classname sent by the form has NOT changed,
      // update the Class with the provided data.

      // If the Classname send by the form HAS changed,
      // check if the new Classname already exists in the
      // current city. If so, throw error-message. If not,
      // update the Class with the provided data

      if (oneClass.name !== name) {
        Class.findOne({
          $and: [{
            name
          }, {
            city
          }]
        }, (err, oneClass) => {
          if (oneClass !== null) {
            console.log("Name existiert bereits in der Stadt");
            req.flash("message", "The Classname already exists in this City");
            res.redirect("/classes/edit/" + classId);
            return;
          } else {
            console.log("Name existiert nicht in der Stadt, bekommt daher Update");

            // Update password, if new one is provided
            if (password !== "") {
              changePassword(password, classId);
            } // End of Update Password

            Class.findByIdAndUpdate(classId, {
                name,
                city
              })
              .then(newClass => {
                res.redirect("/classes/edit/" + classId);
              })
              .catch(err => console.log(err));
          }
        }).catch(err => console.log(err));
      } else {
        console.log("Name ist der gleiche, daher Update");

        // Update password, if new one is provided
        if (password !== "") {
          changePassword(password, classId);
        }

        Class.findByIdAndUpdate(classId, {
            name,
            city
          })
          .then(newClass => {
            res.redirect("/classes/edit/" + classId);
          })
          .catch(err => console.log(err));
      } // end of if (oneClass.name !== name)
    })
    .catch(err => console.log(err)); // end of Class.findById
}); // end of router.post("/edit/:id")

// ------ E d i t  S t u d e n t  ------
router.get("/student/edit/:id", isConnected, isTA, (req, res, next) => {
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

router.post("/student/edit/:id", isConnected, isTA, uploadCloud.single('photo'), (req, res, next) => {
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
        res.render("classes/editstudent", {
          user,
          message: "Indicate full name and birthday"
        });
        return;
      })
      .catch(err => console.log(err));
  } else {
    let username = (firstName + lastName).toLowerCase();
    User.findByIdAndUpdate(req.params.id, {
        firstName,
        lastName,
        birthday,
        role,
        username,
        imgUrl: imgPath,
        imgName
      })
      .then(() => {
        User.findById(req.params.id)
          .then(user => {
            if (user.role === "Teacher") {
              console.log("User is Teacher");
              Class.findByIdAndUpdate(user._class, {
                  _teacher: mongoose.Types.ObjectId(user._id)
                })
                .catch(err => console.log(err));
            }
          })
          .catch(err => console.log(err));
      })
      .then(user => {
        res.redirect(backURL);
      })
      .then(user => {
        res.redirect(backURL);
      })
      .catch(err => console.log(err));
  }
});

// ###########
// D E L E T E
// ###########

// ------ D e l e t e   C l a s s e s  ------
router.get("/delete/:id", isConnected, isTA, (req, res, next) => {
  backURL = req.header('Referer') || '/';
  Promise.all([
      User.remove({
        _class: mongoose.Types.ObjectId(req.params.id)
      }),
      Class.findByIdAndDelete(req.params.id)
    ])
    .then(() => {
      res.redirect(backURL);
    })
    .catch(err => {
      console.log(err);
      next();
    });
});

// ------ D e l e t e   S t u d e n t s  ------
router.get("/delete/student/:id", isConnected, isTA, (req, res, next) => {
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

// #################
// F U N C T I O N S
// #################

function changePassword(password, classId) {
  console.log("Called Passwordchange");
  const salt = bcrypt.genSaltSync(bcryptRounds);
  const hashPass = bcrypt.hashSync(password, salt);
  Class.findByIdAndUpdate(classId, {
      password: hashPass
    })
    .then(() => {
      User.updateMany({
        // Update all Students in this class
        _class: mongoose.Types.ObjectId(classId)
      }, {
        password: hashPass // give new Password to them
      }).catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

module.exports = router;