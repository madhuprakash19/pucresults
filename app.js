const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const findOrCreate = require("mongoose-findorcreate");
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;
var session = require('express-session');
//continue to login user evn after restarting server
var MongoDbStore = require('connect-mongo');
const methodOverride = require("method-override");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// require('medium-editor/dist/css/medium-editor.css');
// require('medium-editor/dist/css/themes/default.css');

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoDbStore.create({
            mongoUrl: process.env.ATLAS_URI
        })
    })
);

app.use(passport.initialize());

//--------Use Passport to deal with sessions--------
app.use(passport.session());

//---------DB connection---------
mongoose.connect(process.env.ATLAS_URI);
// mongoose.set("useCreateIndex", true);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connected");
});


const postSchema = new mongoose.Schema({
    title: String,
    company: String,
    company_position: String,
    startdate: String,
    salary: String,
    rounds: String,
    content: String,
    markdown: String,
    account: String,
    email: String,
    authorId: String,
    timestamp: String,
    likes: Number,
});

const Post = mongoose.model("Post", postSchema);

const userSchema = new mongoose.Schema({
    userHandle: String,
    email: String,
    password: String,
    branch: String,
    name: String,
    USN: String,
    current_sem: String,
    posts: [String],
    likedPosts: [String],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


app.post("/search", (req, res) => {
  namet = req.body.name
  // console.log(namet)
  db.collection("marks").find({name: new RegExp(namet, 'i')}).limit(100).toArray(function (err, result) {
    // console.log(result)
      if (err) throw err;
      res.render("puc", {
        data:result
      })
  });
});

app.get("/",(req,res)=>{
  res.render("name")
})



app.get("/detail/:id", (req, res) => {
  const id = req.params.id;
  const keyarr = []
  const valuearr = []
  db.collection("marks").find({ _id: ObjectId(id) }).toArray(function (err, result) {
      if (err) throw err;
      for (const [key, value] of Object.entries(result[0])) {
        keyarr.push(key);
        valuearr.push(value);
          }
          // console.log(result)
      res.render("detail", {
          data: result[0],
          key : keyarr,
          value : valuearr,
      })
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully");
});
