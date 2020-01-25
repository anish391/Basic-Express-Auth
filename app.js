var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');

var User = require('./models/user');

mongoose.connect("mongodb://localhost/auth_demo_app");

var app = express();
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(require('express-session')({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));   
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ====================================
// Routes
// ====================================

app.get("/", function(req,res){
    res.render("home");
});

// ====================================
// Auth Routes
// ====================================

// Show Sign Up Form
app.get("/register", function(req,res){
    res.render("register");
});

// Handle User Sign Up
app.post("/register", function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    User.register(new User({username: req.body.username}), req.body.password, function(err,user){
       if(err){
           console.log(err);
           res.redirect("register");
       } else{
           passport.authenticate("local")(req,res,function(){
              res.redirect("/secret"); 
           });
       }
    });
});

// Secret Route

app.get("/secret", isLoggedIn, function(req,res){
   res.render("secret");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    } else{
        res.redirect("/login");
    }
}

// ====================================
// Login Routes
// ====================================

app.get("/login", function(req,res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req,res){ 
});

// ====================================
// Logout Routes
// ====================================

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
})

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Secret server started."); 
});