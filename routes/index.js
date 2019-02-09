// EVERY ROUTES FILE MUST END WITH module.exports = router;
const express = require("express");
const router = express.Router();

// HOME PAGE
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/classroom", (req, res, next) => {
  res.render("classroom");
});

module.exports = router;
