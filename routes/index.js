const express = require("express");
const User = require("../models/User");
const Class = require("../models/Class");
const MixMyClass = require("../src/MixMyClass");
const CallQueue = require("../src/CallQueue");
const { dynamicSort } = require("../src/helpers");
const { isConnected } = require("../src/middlewares");

// SOCKET.IO
const {
  updateCourse,
  queueStudent,
  dequeueStudent,
  sudoDequeueStudent,
  wave
} = require("../src/socketAPI");

const router = express.Router();

// HOME PAGE
router.get("/", (req, res, next) => {
  if (req.user) {
    res.render("welcome");
  } else {
    //FIXME: be able to move landing.html to views folder
    res.sendFile("landing.html", { root: __dirname });
  }
});

router.get("/welcome", isConnected, (req, res, next) => {
  res.render("welcome");
});

// ------ C l a s s r o o m ------
router.get("/classroom", isConnected, (req, res, next) => {
  const user = req.user;
  const _class = req.user._class;

  Promise.all([User.find({ _class }), Class.findById(_class).populate("_callQueue")])
    .then(([users, theClass]) => {
      let students = users.filter(user => user.role === "Student");
      students.sort(dynamicSort("firstName"));
      const { _callQueue, currentGroups, currentCourse } = theClass;
      let queueObj = _callQueue.reverse();
      res.render("classroom", { user, queueObj, students, currentCourse, currentGroups });
    })
    .catch(next);
});

// CURRENT COURSE
router.post("/classroom", isConnected, (req, res, next) => {
  let _class = req.user._class;
  let currentCourse = req.body.currentCourse;
  if (currentCourse === "") {
    currentCourse = "Current course/LAB";
  }
  updateCourse(currentCourse);

  Class.findByIdAndUpdate(_class, { currentCourse })
    .then(() => {
      res.redirect("/classroom");
    })
    .catch(next);
});

// CREATE GROUPS
router.post("/classroom/create-groups", isConnected, (req, res, next) => {
  const _class = req.user._class;

  Promise.all([User.find({ _class }), Class.findById(_class)])
    .then(([users, theClass]) => {
      let myClass = new MixMyClass(users, theClass);
      const { groupSize, notPresent, option } = req.body;
      let groups = myClass.createGroups(groupSize, notPresent, option);

      groups.forEach(group => {
        group.forEach(student => {
          User.findByIdAndUpdate(student._id, {
            _workedWith: student._workedWith
          })
            .then(() => {
              // console.log("Student's _workedWith updated");
            })
            .catch(next);
        });
      });

      Class.findByIdAndUpdate(_class, { currentGroups: groups })
        .then(() => {
          console.log("_currentGroups updated!");
          res.redirect("/classroom");
        })
        .catch(next);
    })
    .catch(next);
});
router.get("/classroom/reset-worked-with", isConnected, (req, res, next) => {
  const _class = req.user._class;

  Promise.all([
    User.updateMany({}, { $unset: { _workedWith: "" } }),
    Class.findByIdAndUpdate(_class, { $unset: { currentGroups: "" } })
  ])
    .then(() => {
      res.redirect("/classroom");
    })
    .catch(next);
});

// CALLQUEUE
router.get("/classroom/queue-wave", isConnected, (req, res, next) => {
  let _class = req.user._class;
  Promise.all([User.find(), Class.find({ _id: _class })])
    .then(values => {
      let newCallQueue = new CallQueue(values[0], values[1][0]);
      let queueBefore = newCallQueue.queue.map(obj => obj.toString());
      newCallQueue.wave(req.user);
      let queue = newCallQueue.queue;
      Class.findByIdAndUpdate(_class, { _callQueue: queue })
        .then(() => {
          console.log("Classes _callQueue updated");
          if (req.user.role === "Student" && !queueBefore.includes(req.user._id.toString())) {
            let firstName = req.user.firstName;
            let id = req.user._id;
            // UPDATE VIA DOM
            queueStudent(firstName, id);
            // SEND NOTIFICATION
            wave(firstName)
          }
          
          res.redirect("/classroom");
        })
        .catch(next);
    })
    .catch(next);
});
router.get("/classroom/queue-tick/:studentId", isConnected, (req, res, next) => {
  let studentId = req.params.studentId;
  console.log("TCL: studentId", studentId);
  let _class = req.user._class;
  Promise.all([User.find(), Class.find({ _id: _class })])
    .then(values => {
      let newCallQueue = new CallQueue(values[0], values[1][0]);
      if (studentId === "n-a") {
        newCallQueue.tick(req.user);
        dequeueStudent();
      } else if (req.user.role != "Student" || req.user._id.toString() === studentId) {
        newCallQueue.sudoTick(req.user, studentId);
        sudoDequeueStudent(studentId);
      }
      let queue = newCallQueue.queue;
      Class.findByIdAndUpdate(_class, { _callQueue: queue })
        .then(() => {
          console.log("Classes _callQueue updated");
          res.redirect("/classroom");
        })
        .catch(next);
    })
    .catch(next);
});

module.exports = router;
