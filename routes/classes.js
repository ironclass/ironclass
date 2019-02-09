const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport"); // TO USE PROTECED ROUTES
const User = require("../models/User");
const Class = require("../models/Class");
const { isConnected, checkRole } = require('../middlewares')

// C R E A T E 
router.get("/create", (req, res, next) => {
  res.render("classes/create");
});

router.post("/createclass", (req, res, next) => {
  const { name, city, password } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS USER CREATION
  if (name === "" || city === "" || password === "") {
    res.render("classes/create", { message: "Indicate name, city and password" });
    return;
  }

  Class.findOne({ name }, "name", (err, user) => {
    if (user !== null) {
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
			console.log('TCL: newClass', newClass)
      res.redirect("/classes/edit/"+newClass._id);
    })
    .catch(err => {
      res.render("classes/create", { message: "Something went wrong" });
    });
  });
});

// S H O W

router.get("/", isConnected, (req, res, next) => {
  Class.find()
  .populate('_teacher')
  .populate('_TA')
  .then (classes => {
    res.render("classes/show", {classes});
  })
  .catch(err => console.log(err));
});

// E D I T

router.get("/edit/:id", (req, res, next) => {
  res.render("classes/edit");
});

// D E L E T E

router.get("/delete", (req, res, next) => {
  res.render("classes/delete");
});

module.exports = router;
