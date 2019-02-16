const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    password: { type: String, required: true },
    currentCourse: { type: String, default: "Current course/LAB" },
    currentGroups: [Object],
    clientsOnline: { type: Number, default: 0 },
    _callQueue: [{ type: Schema.Types.ObjectId, ref: "User"}],
    _teacher: { type: Schema.Types.ObjectId, ref: "User" },
    _TA: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);
// M E T H O D S 

classSchema.statics.checkIfClassExists = function checkIfClassExists (oneClass, backURL, req, res) {
  console.log("checkIfClassExists called")
  if (oneClass !== null) {
    req.flash("error", "The Classname already exists in this City");
    res.redirect("/classes");
    return true;
  } else return false;
};

classSchema.statics.classUpdate = function classUpdate(classId, newClassObj, res) {
  // Update password, if new one is provided
  if (newClassObj.password !== "") changePassword(newClassObj.password, classId);

  Class.findByIdAndUpdate(classId, newClassObj)
  .then(newClass => res.redirect("/classes"))
  .catch(err => console.log(err));
};

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
