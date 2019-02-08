// HERE WE CHOOSE THE TYPE OF THE STRATEGY AND SERIALIZATION PROCESS AND PASS IT TO app.js
const passport = require("passport");

require("./serializers");
require("./localStrategy");

module.exports = app => {
  app.use(passport.initialize());
  app.use(passport.session());
};
