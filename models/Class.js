// const { changePassword }  = require("../src/helpers");
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

classSchema.statics.classUpdate = function classUpdate(classId, newClassObj, req, res) {
  Class.findByIdAndUpdate(classId, newClassObj)
  .then(newClass => {
    req.flash("success", "Class successfully updated");    
    res.redirect("/classes");
  })
  .catch(err => console.log(err));
};

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
