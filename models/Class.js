const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    password: { type: String, required: true },
    currentCourse: { type: String, default: "Click me to change" },
    currentGroups: [Object],
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

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
