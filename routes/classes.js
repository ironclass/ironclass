// TODO: Avoid double Names when editing
// TODO: Avoid clearing form, wen re-render page with error message
// TODO: check if password has changed 

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport"); // TO USE PROTECED ROUTES
const User = require("../models/User");
const Class = require("../models/Class");
const {isConnected, checkRole } = require('../middlewares')

// C R E A T E 
router.get("/create", isConnected, checkRole("TA"), (req, res, next) => {
  res.render("classes/create");
});

router.post("/createclass", isConnected, checkRole("TA"), (req, res, next) => {
  const { name, city, password } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS USER CREATION
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
			console.log('TCL: newClass', newClass)
      res.redirect("/classes/edit/"+newClass._id);
    })
    .catch(err => {
      res.render("classes/create", { message: "Something went wrong" });
    });
  });
});

// S H O W

router.get("/", isConnected, checkRole("TA"), (req, res, next) => {
  Class.find()
  .populate('_teacher')
  .populate('_TA')
  .then (classes => {
    res.render("classes/show", {classes});
  })
  .catch(err => console.log(err));
});

// E D I T

router.get("/edit/:id", isConnected, checkRole("TA"), (req, res, next) => {
  Class.findById(req.params.id)
  .then(oneClass => {
		console.log('TCL: oneClass', oneClass)
    res.render("classes/edit", {oneClass});
  })
  .catch(err => console.log(err));
});

router.post("/edit/:id", isConnected, checkRole("TA"), (req, res, next) => {
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

// D E L E T E

router.get("/delete/:id", isConnected, checkRole("TA"), (req, res, next) => {
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
