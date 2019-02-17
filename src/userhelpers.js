const User = require("../models/User");
const mongoose = require('mongoose');
const { addTeacherToClass, removeTeacherfromClass, addTAToClass, removeTAfromClass, switchToTeacher  }  = require("../src/helpers");

module.exports = {

updateUser: function (userId, newUserObj, res) {
  User.findById(userId)
  .then ((user) => {
    let oldRole = user.role;
    User.findByIdAndUpdate(userId, newUserObj)
    .then(() => {
      User.findById(userId)
      .then(user => {        
        if (oldRole === "TA" && user.role !== "TA") {
          removeTAfromClass (user._class, user._id);
          if (user.role === "Teacher") {
            // TODO: DRY CODE HERE
            // Search for all Teachers in current Class except the current user and set them to Students. 
            // then add the Current user as a teacher to class. This way only on teacher is in class.
            User.updateMany({ $and: [ { role: "Teacher" }, {_class : {$eq: mongoose.Types.ObjectId(user._class) }},{ _id: { $ne: mongoose.Types.ObjectId(user._id) } } ] },
            { $set: { role : "Student" } })
            .then(() => {
              console.log("call addTeacherToClass")
              addTeacherToClass (user._class, user._id); 
            }).catch(err => console.log(err));
          }
        } else if (oldRole === "Teacher" && user.role !== "Teacher") {
          // Remove all Teacherroles from class
          User.updateMany({ $and: [ { role: "Teacher" }, {_class : {$eq: mongoose.Types.ObjectId(user._class) }} ] },
            { $set: { role : "Student" } });
          removeTeacherfromClass (user._class); 
          if (user.role === "TA") {
            addTAToClass (user._class, user._id);
          }
        } else {
          if (user.role === "Teacher") {
            // TODO: AND DRY CODE HERE
            // Search for all Teachers in current Class except the current user and set them to Students. 
            // then add the Current user as a teacher to class. This way only on teacher is in class.
            User.updateMany({ $and: [ { role: "Teacher" }, {_class : {$eq: mongoose.Types.ObjectId(user._class) }},{ _id: { $ne: mongoose.Types.ObjectId(user._id) } } ] },
            { $set: { role : "Student" } })
            .then(() => {
              console.log("call addTeacherToClass")
              addTeacherToClass (user._class, user._id); 
            }).catch(err => console.log(err));
          } else if (user.role === "TA") {
            addTAToClass (user._class, user._id);
          }
        }
      }).catch(err => console.log(err));
    })
    .then(user => {
        User.findById(userId)
        .then((user) => res.redirect("/classes/edit/"+user._class))
        .catch(err => console.log(err)); 
    })
    .catch(err => console.log("Creation error: "+err));
  }).catch(err => console.log(err));
},

createNewUserInClass: function createNewUserInClass (newUserObj, classId, req, res, backURL) {
  User.create(newUserObj)
  .then((createdUser) => {
    if (createdUser.role === "Teacher") addTeacherToClass(classId, createdUser._id);
    else if (createdUser.role === "TA") addTAToClass(classId, createdUser._id);
  })
  .then(() => {
      req.flash("success", "New User added");
      res.redirect(backURL);
  }).catch(err => console.log(err)); 
}

};