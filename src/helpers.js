const User = require("../models/User");
const Class = require("../models/Class");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const bcryptRounds = 10;

module.exports = {

  addTeacherToClass: function (classId, userId) {
    Class.findByIdAndUpdate(classId, {
      _teacher: mongoose.Types.ObjectId(userId)
    })
    .catch(err => console.log(err));
  },

  removeTeacherfromClass: function (classId) {
    console.log("Remove Teacher from Class called")
    User.findOneAndUpdate(
      {$and: [{"_class": mongoose.Types.ObjectId(classId)},{"role": "Teacher"}] }, // find current Teacher in Class
      {role: "Student"} // and set back the role to Student
    )
    .then(() => {
      Class.findByIdAndUpdate(classId, {
        _teacher: undefined
      })
      .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  },

  addTAToClass: function (classId, userId) {
    Class.findByIdAndUpdate(classId, {
      $push: { _TA: mongoose.Types.ObjectId(userId) }
    })
    .catch(err => console.log(err));
  },

  removeTAfromClass: function (classId, userId) {
    Class.findByIdAndUpdate(classId, {
      $pullAll: { _TA: [mongoose.Types.ObjectId(userId)] }
    })
    .catch(err => console.log(err));
  },
  changePassword: function (password, classId) {
    console.log("Called Passwordchange");
    const salt = bcrypt.genSaltSync(bcryptRounds);
    const hashPass = bcrypt.hashSync(password, salt);
    Class.findByIdAndUpdate(classId, {
        password: hashPass
      })
      .then(() => {
        User.updateMany({
          // Update all Students in this class
          _class: mongoose.Types.ObjectId(classId)
        }, {
          password: hashPass // give new Password to them
        }).catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
};