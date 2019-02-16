const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthday: { type: Date },
    imgUrl: {
      type: String,
      default:
        "https://www.axiumradonmitigations.com/wp-content/uploads/2015/01/icon-user-default.png"
    },
    imgName: String,
    username: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["Teacher", "TA", "Student"], default: "Student" },
    admin: { type: Boolean, default: false },
    // waving: { type: Boolean, default: false }, // NOT NEEDED
    _class: { type: Schema.Types.ObjectId, ref: "Class" },
    _workedWith: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// M E T H O D S 

userSchema.statics.checkIfUserExists = function checkIfUserExists (user, backURL, req, res) {
  if (user !== null) {
    req.flash("error", "This User already exists");
    res.redirect(backURL);
    return true;
  } else return false;
};

userSchema.statics.createNewUserInClass = function createNewUserInClass (newUserObj, classId, req, res, backURL) {
  User.create(newUserObj)
  .then((createdUser) => {
    if (createdUser.role === "Teacher") addTeacherToClass(classId, createdUser._id);
    else if (createdUser.role === "TA") addTAToClass(classId, createdUser._id);
  })
  .then(() => {
      req.flash("success", "New User added");
      res.redirect(backURL);
  }).catch(err => console.log(err)); 
};

userSchema.statics.updateUser = function updateUser(userId, newUserObj, res) {
  User.findById(userId)
  .then ((user) => {
    let oldRole = user.role;
    User.findByIdAndUpdate(userId, newUserObj)
    .then(() => {
      User.findById(userId)
      .then(user => {
        if (oldRole === "TA" && user.role !== "TA") {
          removeTAfromClass (user._class, user._id);
          if (user.role === "Teacher") addTeacherToClass (user._class, user._id);
        } else if (oldRole === "Teacher" && user.role !== "Teacher") {
          removeTeacherfromClass (user._class);
          if (user.role === "TA") addTAToClass (user._class, user._id);
        } else {
          if (user.role === "Teacher") {
            addTeacherToClass (user._class, user._id);
          } else if (user.role === "TA") addTAToClass (user._class, user._id);
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
};

userSchema.statics.setBirthday = function setBirthday(user) {
  if (user.birthday !== null) return user.birthday.toISOString().substr(0, 10);
  else return new Date().toISOString().substr(0, 10);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
