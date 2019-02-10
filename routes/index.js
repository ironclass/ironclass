// EVERY ROUTES FILE MUST END WITH module.exports = router;
const express = require("express");
const router = express.Router();
const {isConnected, checkRole } = require('../middlewares')

// HOME PAGE
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/classroom", isConnected, (req, res, next) => {
  res.render("classroom");
});

module.exports = router;
