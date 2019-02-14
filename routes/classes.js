const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const passport = require("passport"); // TO USE PROTECED ROUTES
const {changePassword, dynamicSort}  = require("../src/helpers");
const User = require("../models/User");
const Class = require("../models/Class");
const {
  isConnected,
  isTA
} = require("../src/middlewares");
const bcryptRounds = 10;

// ###########
// C R E A T E
// ###########

// ------ C r e a t e   C l a s s e s ------

router.get("/create", isConnected, isTA, (req, res, next) => {
  res.render("classes/create");
});

router.post("/createclass", isConnected, isTA, (req, res, next) => {
  const {
    name,
    city,
    password
  } = req.body;

  // DATA VALIDATION AND AFTER SUCCESS CLASS CREATION
  if (name === "" || city === "Choose city..." || password === "") {
    res.render("classes/create", {
      error: "Indicate name, city and password"
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
        error: "The Classname already exists"
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
          error: "Something went wrong"
        });
      });
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
      classes.sort(dynamicSort("name"));
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
      values[1].sort(dynamicSort("name")).reverse(); //TODO: Optional choice for sort by "updated_at"
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
      error: "Indicate name and city"
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
            req.flash("error", "The Classname already exists in this City");
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
                res.redirect("/classes");
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
            res.redirect("/classes");
          })
          .catch(err => console.log(err));
      } // end of if (oneClass.name !== name)
    })
    .catch(err => console.log(err)); // end of Class.findById
}); // end of router.post("/edit/:id")

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