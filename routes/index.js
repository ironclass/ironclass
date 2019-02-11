// EVERY ROUTES FILE MUST END WITH module.exports = router;
const express = require("express");
const User = require("../models/User");
const MixMyClass = require("../src/MixMyClass");
const { isConnected } = require("../middlewares");

const router = express.Router();
// HOME PAGE
router.get("/", (req, res, next) => {
  res.render("index");
});

// ------ C l a s s r o o m ------
router.get("/classroom", isConnected, (req, res, next) => {
  User.find()
    .then(users => {
      let students = users.filter(user => user.role === "Student");
      res.render("classroom", { students });
    })
    .catch(next);
});
router.post("/classroom", isConnected, (req, res, next) => {
  User.find()
    .then(users => {
      let myClass = new MixMyClass(users);
      const { groupSize, notPresent, option } = req.body;
      let groups = myClass.createGroups(groupSize, notPresent, option);
      // res.send(req.body);
      // res.send(groups);
      res.render("classroom", { groups });
    })
    .catch(next);
});

module.exports = router;
