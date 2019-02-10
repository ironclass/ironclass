// TODO: Avoid double Names when editing
// TODO: Avoid clearing form, wen re-render page with error message
// TODO: check if password has changed 
// TODO: Redirect with error messages?
// TODO: pass all Users to redirect after creation of new user or just render page?


const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport"); // TO USE PROTECED ROUTES
const User = require("../models/User");
const Class = require("../models/Class");
const {isConnected, isTA, checkRole } = require('../middlewares')

// ###########
// C R E A T E 
// ###########

router.get("/create", isConnected, isTA, (req, res, next) => {
  res.render("classes/create");
});

// ------ C l a s s e s ------
router.post("/createclass", isConnected, isTA, (req, res, next) => {
  const { name, city, password } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS CLASS CREATION
  if (name === "" || city === "Choose city..." || password === "") {
    res.render("classes/create", { message: "Indicate name, city and password" });
    return;
  }

  Class.findOne({ name }, "name", (err, oneClass) => {
    if (oneClass !== null ) {
      res.render("classes/create", { message: "The Classname already exists" });
      return;
    }

    const bcryptRounds = 10;
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

// ------ S t u d e n t s  ------

router.post("/createStudent/:classId", isConnected, isTA, (req, res, next) => {
  // get ID of current Class
    const classId = req.params.classId;

  // Find the current Class-Password
    let classPassword;
    Class.findById(classId)
    .then(oneClass => 
      classPassword = oneClass.password
    )  
    .catch(err => console.log(err));

  // get Data from form
    const { firstName, lastName, birthday } = req.body;
    let username = (firstName + lastName).toLowerCase();

  // data validatopn and after success user creation
    if (firstName === "") {
      // res.render("classes/edit", { message: "Indicate first name" });
      // TODO: Redirect with error messages?
      res.redirect("/classes/edit/"+classId);
      return;
    }
  
    User.findOne({ username }, (err, user) => {
      if (user !== null ) {
        // res.render("classes/create", { message: "The Classname already exists" });
        // return;
        console.log(username + " alread exists!");
      } 
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
  Class.findById(req.params.id)
  .then(oneClass => {
    res.render("classes/edit", {oneClass});
  })
  .catch(err => console.log(err));
});

router.post("/edit/:id", isConnected, isTA, (req, res, next) => {
  const { name, city, password } = req.body;

  if (name === "" || city === "Choose city...") {
    res.render("classes/edit", { message: "Indicate name and city" });
    return;
  }

  Class.findByIdAndUpdate(req.params.id, {
    name: name,
    city: city
  })
  .then((updatedClass) => {
    res.redirect("/classes");
  })
  .catch(err => {
    res.render("classes/create", { message: "Something went wrong" });
  });
});

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
