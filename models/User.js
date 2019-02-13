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

const User = mongoose.model("User", userSchema);
module.exports = User;
