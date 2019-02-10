// TODO: Avoid double Names when editing
// TODO: Avoid clearing form, wen re-render page with error message
// TODO: check if password has changed, when editing
// TODO: Redirect with error messages?

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const passport = require("passport"); // TO USE PROTECED ROUTES
const User = require("../models/User");
const Class = require("../models/Class");
const {isConnected, isTA } = require('../middlewares');
const bcryptRounds = 10;

// ###########
// C R E A T E 
// ###########

router.get("/create", isConnected, isTA, (req, res, next) => {
  res.render("classes/create");
});

// ------ C r e a t e   C l a s s e s ------
router.post("/createclass", isConnected, isTA, (req, res, next) => {
  const { name, city, password } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS CLASS CREATION
  if (name === "" || city === "Choose city..." || password === "") {
    res.render("classes/create", { message: "Indicate name, city and password" });
    return;
  }

  Class.findOne({ name }, (err, oneClass) => {
    if (oneClass !== null ) {
      console.log(oneClass.name + " already exists");
      res.render("classes/create", { message: "The Classname already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptRounds);
    const hashPass = bcrypt.hashSync(password, salt);

    Class.create({
      name: name,
      city: city, 
      password: hashPass
    })
    .then((newClass) => {
      res.redirect("/classes/edit/"+newClass._id);
    })
    .catch(err => {
      res.render("classes/create", { message: "Something went wrong" });
    });
  });
});

// ------ C r e a t e   S t u d e n t s  ------

router.post("/createStudent/:classId", isConnected, isTA, (req, res, next) => {
  // get ID of current Class
    const classId = req.params.classId;
		console.log('TCL: classId', classId)

  // get Data from form
    const { firstName, lastName, birthday } = req.body;
    let username = (firstName + lastName).toLowerCase();

    let classPassword;

  // data validatopn and after success user creation
    if (firstName === "") {
      req.flash("message", "Indicate first name");
      res.redirect("/classes/edit/"+classId);
      return;
    }
  
    User.findOne({ username }, (err, user) => {
      if (user !== null ) {
        console.log(username + " alread exists!");
        req.flash("message", "The User already exists");
        res.redirect("/classes/edit/"+classId);
        return;
      } 
    })
    .then(() => {
      // Find the current Class-Password
      Class.findById(classId)
      .then(oneClass => {
        classPassword = oneClass.password;
      })
      .then(() => {
        User.create({
          firstName, 
          lastName,
          username,
          birthday,
          password: classPassword,
          _class: classId
        })
        .then (user => {
          console.log("Created User: " + user);
          // TODO: pass all Users to redirect after creation of new user or just render page?
          res.redirect("/classes/edit/"+classId);
        })
        .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
    })
    .catch(err => console.log(err));    
});


// ###########
//   S H O W
// ###########

router.get("/", isConnected, isTA, (req, res, next) => {
  Class.find()
  .populate('_teacher')
  .populate('_TA')
  .then (classes => {
    res.render("classes/show", {classes});
  })
  .catch(err => console.log(err));
});

// ###########
//   E D I T
// ###########

router.get("/edit/:id", isConnected, isTA, (req, res, next) => {
// find current Class and all students in it 
  Promise.all([
    Class.findById(req.params.id), 
    User.find({ _class: mongoose.Types.ObjectId(req.params.id)})
  ])
  .then(values => {
    res.render("classes/edit", {
      message: req.flash("message"),
      oneClass: values[0], // the class with this ID
      students: values[1]  // all students in it
    });
  })
  .catch(err => console.log(err));
});

router.post("/edit/:id", isConnected, isTA, (req, res, next) => {
  // get ID of current Class
  const classId = req.params.id;
  // get Info from Post-Body
  const { name, city, password } = req.body;

  // check if minimum credentials are provided
  if (name === "" || city === "Choose city...") {
    res.render("classes/edit", { message: "Indicate name and city" });
    return;
  }

  // Update password, if new one is provided
  if (password !== "") {
    console.log("Called Passwordchange");
    const salt = bcrypt.genSaltSync(bcryptRounds);
    const hashPass = bcrypt.hashSync(password, salt);
    Class.findByIdAndUpdate(classId, {
      password: hashPass
    })
    .then(() => {
      User.updateMany({ // Update all Students in this class
      _class: mongoose.Types.ObjectId(classId)
      },{
        password: hashPass // give new Password to them
      })
      .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  } // End of Update Password

  // check if Classname alread exists, if not update
  Class.findOne({ name }, (err, oneClass) => {
    if (oneClass !== null ) {
      req.flash("message", "The Class already exists");
      res.redirect("/classes/edit/"+classId);
      return;
    } else {
      Class.findByIdAndUpdate(classId, {
        name,
        city
      })
      .then (newClass => {
        res.redirect("/classes/edit/"+classId);
      }) // end of find and update
      .catch(err => console.log(err));
    } // end of IF not exist ELSE update class
  })
  .catch(err => console.log(err));
}); // end of router.post("/edit/:id")

// ###########
// D E L E T E
// ###########

router.get("/delete/:id", isConnected, isTA, (req, res, next) => {
  Class.findByIdAndDelete(req.params.id)
  .then(() => {
    res.redirect("/classes");
  })
  .catch(err => {
    console.log(err);
    next();
  });
});

module.exports = router;
