require("dotenv").config();
const path = require("path");
const User = require("./models/User");
const mongoose = require("mongoose");
const { connection } = require("./util/client");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const multer = require("multer");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const Router = require("./router");
const app = express();
const Store = new MongoDbStore({
  uri: connection,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "images/";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const handleFileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else cb(null, false);
};

app.use(
  multer({
    storage: fileStorage,
    dest: "images",
    fileFilter: handleFileFilter,
  }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "test secret",
    resave: false,
    saveUninitialized: false,
    store: Store,
  })
);
app.use(csrf({ cookie: true }));

app.set("view engine", "pug");
app.set("views", "views");

// getting the user login
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session?.user?._id)
    .then((user) => {
      if (!user) {
        const error = new Error();
        error.httpStatusCode = 500;
        return next(error);
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
});

app.use((req, res, next) => {
  res.locals.user = req?.user;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/", Router);

app.use("/500", (req, res, next) => {
  res.render("500", { title: "500 error" });
});

app.use((error, req, res, next) => {
  res.status(500).render("500", { title: "500 error" });
});

app.use((req, res, next) => {
  res.status(404).render("404", { title: "404 error" });
});

mongoose
  .connect(connection)
  .then((result) => {
    app.listen(process.env.PORT);
    console.log("Mongoose has connected this app to MongoDB");
  })
  .catch((err) => {
    console.error(err);
  });
