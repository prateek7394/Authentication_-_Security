require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// 3 new packages
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret: "Kuchh bhi likh do yaha pe",
    resave: false,
    saveUninitialized: false
}));

// Initialise passport
app.use(passport.initialize());

// Use passport to initialise session
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password : String
});

userSchema.plugin(passportLocalMongoose);
 
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("home");
})
app.get("/login", function(req,res){
    res.render("login");
})
app.get("/register", function(req,res){
    res.render("register");
})
app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

// logout method of passport is used
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});


app.post("/register", function(req,res){

//  use method provided by passportpackage
    User.register({username:req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res , function(){
        //  since the users are being authenticated and a login session is saved for them in the cookies,
        //  therefore they are redirected to the secrets route if they were previously logged in
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    // Here login function provided by passport is used
    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req, res , function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000,function(){
    console.log("Server running on port 3000!")
})