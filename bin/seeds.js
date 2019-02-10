// To execute this seed, run from the root of the project
// $ node bin/seeds.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Class = require("../models/Class");

const bcryptSalt = 10;

mongoose
  .connect("mongodb://localhost/ironclass", { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

let users = [
  {
    firstName: "Andre",
    lastName: "Sebastian",
    // birthday: new Date("March 14 1981").setHours(24,0,0,0),
    birthday: new Date(1981, 2, 14).setHours(24,0,0,0),
    username: ("Andre" + "Sebastian").toLowerCase(),
    password: bcrypt.hashSync("andre", bcrypt.genSaltSync(bcryptSalt)),
    role: "Student",
    admin: true
  },
  {
    firstName: "Malte",
    lastName: "Felmy",
    // birthday: new Date("November 26 1990").setHours(24,0,0,0),
    birthday: new Date(1990, 10, 26).setHours(24,0,0,0),
    username: ("Malte" + "Felmy").toLowerCase(),
    password: bcrypt.hashSync("malte", bcrypt.genSaltSync(bcryptSalt)),
    role: "Student",
    admin: true
  },
  {
    firstName: "Julia",
    lastName: "Miller",
    // birthday: new Date("November 26 1990").setHours(24,0,0,0),
    birthday: new Date(1990, 4, 3).setHours(24,0,0,0),
    username: ("Julia" + "Miller").toLowerCase(),
    password: bcrypt.hashSync("julia", bcrypt.genSaltSync(bcryptSalt)),
    role: "Student",
  },
  {
    firstName: "Maxence",
    lastName: "Teacher",
    // birthday: new Date("January 1 1970").setHours(24,0,0,0),
    birthday: new Date(1970, 0, 1).setHours(24,0,0,0),
    username: ("Maxence" + "Teacher").toLowerCase(),
    password: bcrypt.hashSync("t", bcrypt.genSaltSync(bcryptSalt)),
    role: "Teacher"
  },
  {
    firstName: "Thor",
    lastName: "TA",
    // birthday: new Date("January 1 1970").setHours(24,0,0,0),
    birthday: new Date(1970, 0, 1).setHours(24,0,0,0),
    username: ("Thor" + "TA").toLowerCase(),
    password: bcrypt.hashSync("t", bcrypt.genSaltSync(bcryptSalt)),
    role: "TA"
  }
];
let classes = [
  {
    name: "WebDev FT, Jan 19",
    city: "Berlin",
    currentCourse: "Second Project"
  },
  {
    name: "UX/UI FT, Jan 19",
    city: "Berlin",
    currentCourse: "Advanced User Interface Development"
  }
];

Promise.all([User.deleteMany(), Class.deleteMany()])
  .then(() => {
    Promise.all([User.create(users), Class.create(classes)])
      .then(values => {
        console.log(`${values[0].length} users created with the following id:`);
        console.log(values[0].map(u => u._id));
        console.log(`${values[1].length} classes created with the following id:`);
        console.log(values[1].map(c => c._id));

        mongoose.disconnect();
      })
      .catch(err => {
        mongoose.disconnect();
        throw err;
      });
  })
  .catch(err => {
    mongoose.disconnect();
    throw err;
  });
