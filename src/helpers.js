const User = require("../models/User");
const Class = require("../models/Class");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const bcryptRounds = 10;

module.exports = {

  addTeacherToClass: function (classId, userId) {
    Class.findByIdAndUpdate(classId, {
      _teacher: mongoose.Types.ObjectId(userId)
    }).catch(err => console.log(err));
  },

  removeTeacherfromClass: function (classId) {
    console.log("Remove Teacher from Class called")
    Class.findByIdAndUpdate(classId, {
      _teacher: undefined
    }).catch(err => console.log(err));
  },

  addTAToClass: function (classId, userId) {
    Class.findByIdAndUpdate(classId, {
      $push: { _TA: mongoose.Types.ObjectId(userId) }
    }).catch(err => console.log(err));
  },

  removeTAfromClass: function (classId, userId) {
    Class.findByIdAndUpdate(classId, {
      $pullAll: { _TA: [mongoose.Types.ObjectId(userId)] }
    }).catch(err => console.log(err));
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
      }).catch(err => console.log(err));
  },

  dynamicSort: function (property) {
    let sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
  },

  setImageData: function (req) {
    if (req.file) return {url: req.file.url, name: req.file.originalname };
    else return {url: "https://www.axiumradonmitigations.com/wp-content/uploads/2015/01/icon-user-default.png", name: "default"};
  },
  
  setBirthday: function setBirthday(user) {
    if (user.birthday !== null) return user.birthday.toISOString().substr(0, 10);
    else return "";
  }

};