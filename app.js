require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash"); // MANAGES ERRORS DURING LOGIN PROCESS

mongoose
  .connect(process.env.DB_URI, { useNewUrlParser: true })
  // .connect("mongodb://localhost/ironclass", { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(`${app_name}:${path.basename(__filename).split(".")[0]}`);

const app = express();

// MIDDLEWARE SETUP, INDICATED BY app.use()
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// EXPRESS VIEW ENGIN SETUP
app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// VALUE FOR TITLE, THAT IS ACCESSIBLE IN THE VIEW DUE TO app.locals
app.locals.title = "IronClass";

// ENABLE AUTHENTICATION USING PASSPORT & SESSION AND FLASH FOR ERROR HANDLING
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
app.use(flash());
require("./passport")(app);

app.use((req, res, next) => {
  res.locals.isConnected = !!req.user;
  res.locals.isNotConnected = !req.user;
  
  res.locals.error  = req.flash("error");
  res.locals.success  = req.flash("success");
 
  if (req.user) {
    res.locals.firstName = req.user.firstName;
    res.locals.isTeacher = req.user.role === "Teacher" || req.user.admin === true;
    res.locals.isTA =
      req.user.role === "TA" || req.user.role === "Teacher" || req.user.admin === true;
    res.locals.isStudent = req.user.role === "Student" || req.user.admin === true;
    res.locals.isAdmin = req.user.admin === true;
  }

  hbs.registerHelper("isCurrentUser", function(value, options) {
    let fnTrue = options.fn;
    let fnFalse = options.inverse;

    return value == req.user._id.toString() ? fnTrue(this) : fnFalse(this);
  });

  hbs.registerHelper("isCurrentUserOrTA", function(value, options) {
    let fnTrue = options.fn;
    let fnFalse = options.inverse;

    let answer = false;
    if (value == req.user._id.toString() || req.user.role === "TA" || req.user.role === "Teacher") {
      answer = true;
    }

    return answer ? fnTrue(this) : fnFalse(this);
  });

  next();
});

// MOUNTPOINT FOR THE ROUTES: if URL is "/..." look for routes in "./routes/..."
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/classes", require("./routes/classes"));
app.use("/users", require("./routes/users"));

hbs.registerHelper("select", function(value, options) {
  return options.fn(this).replace(new RegExp(' value="' + value + '"'), '$& selected="selected"');
});

// helper, for subgrouping items
hbs.registerHelper("groupedEach", function(every, context, options) {
  var out = "",
    subcontext = [],
    i;
  if (context && context.length > 0) {
    for (i = 0; i < context.length; i++) {
      if (i > 0 && i % every === 0) {
        out += options.fn(subcontext);
        subcontext = [];
      }
      subcontext.push(context[i]);
    }
    out += options.fn(subcontext);
  }
  return out;
});

hbs.registerHelper("toUpperCase", function(str) {
  return str.toUpperCase();
});


module.exports = app;
