const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const {dynamicSort, changePassword}  = require("../src/helpers");
const User = require("../models/User");
const Class = require("../models/Class");
const { isConnected, isTA } = require("../src/middlewares");
const bcryptRounds = 10;

// ###########
// C R E A T E
// ###########

// ------ C r e a t e   C l a s s e s ------

router.get("/create", isConnected, isTA, (req, res, next) => {
  res.render("classes/create");
});

router.post("/create", isConnected, isTA, (req, res, next) => {
  backURL = req.header('Referer') || '/';
  const { name, city, password } = req.body;
  const salt = bcrypt.genSaltSync(bcryptRounds);
  const hashPass = bcrypt.hashSync(password, salt);

  // DATA VALIDATION AND AFTER SUCCESS CLASS CREATION
  if (name === "" || city === "Choose city..." || password === "") {
    req.flash("error", "Indicate name, city and password");
    res.redirect(backURL);
    return;
  }

  Class.findOne({$and: [{ name }, { city }] })
  .then (oneClass => {
    if (oneClass !== null) {
      req.flash("error", "The Classname already exists in this City");
      res.redirect("/classes");
      return;
    } 
    Class.create({name, city, password: hashPass})
    .then((newClass) => res.redirect("/classes/edit/" + newClass._id))
    .catch(err => console.log(err));
  }).catch(err => console.log(err));
});

// ###########
//   S H O W
// ###########

router.get("/", isConnected, isTA, (req, res, next) => {
  Class.find()
    .populate("_teacher")
    .populate("_TA")
    .then(classes => {
      classes.sort(dynamicSort("name"));
      res.render("classes/show", { classes });
    }).catch(err => console.log(err));
});

// ###########
//   E D I T
// ###########

// ------ E d i t  C l a s s e s  ------
router.get("/edit/:id", isConnected, isTA, (req, res, next) => {
  let classId = req.params.id;
  // find current Class and all students in it
  Promise.all([
    Class.findById(classId),
    User.find({_class: mongoose.Types.ObjectId(classId), role: "Student"}),
    User.find({_class: mongoose.Types.ObjectId(classId), role: "TA"}),
    User.find({_class: mongoose.Types.ObjectId(classId), role: "Teacher"})
  ])
  .then(values => {
    for (let i = 1 ; i < values.length; i++){  // Loop through the Promise Values and Sort
      values[i].sort(dynamicSort("lastName")); //TODO: Optional choice for sort by "updated_at".reverse()
    }
    res.render("classes/edit", {
      oneClass: values[0], // the class with this ID
      students: values[1], // all students in it
      tas: values[2], // all TAst
      teacher: values[3] // all Teachers in it
    });
  }).catch(err => console.log(err));
});

router.post("/edit/:id", isConnected, isTA, (req, res, next) => {
  backURL = req.header('Referer') || '/';
  const classId = req.params.id;
  const { name, city, password } = req.body;
  if (password !== "") changePassword(password, classId);



  // check if minimum credentials are provided
  if (name === "" || city === "Choose city...") {
    req.flash("error", "Please indicate name and city");
    res.render("classes/edit");
    return;
  } else {
  // If the Classname sent by the form has NOT changed,
  // update the Class with the provided data.

  // If the Classname send by the form HAS changed,
  // check if the new Classname already exists in the
  // current city. If so, throw error-message. If not,
  // update the Class with the provided data.
    let newClassObj = { name, city }; 
    Class.findById(classId)
    .then(oneClass => {
      if (oneClass.name !== name || oneClass.city !== city) {
        console.log("Name oder Stadt hat sich geändert, also Prüfung")
        Class.findOne({ name, city })
        .then(oneClass => {
          if (oneClass !== null) {
            req.flash("error", "The Classname already exists in this City");
            res.redirect("/classes");
            return;
          } else {
              if (password !== "") changePassword(password, classId);
              Class.classUpdate(classId, newClassObj, req, res);   
          }
        }).catch(err => console.log(err));
      } else {
        if (password !== "") changePassword(password, classId); 
        Class.classUpdate(classId, newClassObj, req, res);
      }
    }).catch(err => console.log(err));
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