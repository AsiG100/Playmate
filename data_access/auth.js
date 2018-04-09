var mongoose = require("mongoose"),
    express  = require("express"),
    app      = express(),
    passport = require("passport");
    
mongoose.connect("mongodb://localhost/playmate");

app.use(passport.initialize());
app.use(passport.session());