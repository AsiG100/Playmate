var express = require("express"),
    app = express(),
    request = require("request"),
    bodyParser = require('body-parser'),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    facebookStrategy = require("passport-facebook"),
    User = require("./data_access/schemas.js").user;
//FILES
var dataAcess = require("./data_access/dataAccess.js");

//SETTINGS---------------------------------------------
app.set('view engine', 'ejs');
app.set('views', "./views");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//PASSPORT CONFIG/////////////////////////////
app.use(require("express-session")({
    secret: "something",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

//AUTH ROUTES/////////////////////////////////////////////////

app.get('/register', function(req, res) {
    res.render("signUp");
});

app.post('/register', function(req, res) {
    var details = req.body.user;
    var newUser = new User({username: details.username});
    User.register(newUser, details.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("register");
        }
        else {
            dataAcess.saveUserToDB(user, details);
            req.login(user, function(err) {
                if (err) {
                console.log(err);
                }
            return res.redirect('/');
            });
            }
        });
    });


app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    function(req, res) {
        console.log("redirecting...");
        res.redirect('/');

    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});
///FACEBOOK AUTH/////////////////////////////////////////////
var FACEBOOK_APP_ID = '282940592244352',
    FACEBOOK_SECRET = 'ce4b31f6295d761776bb325df2d2ab7a';

var fbOptions = {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_SECRET,
    callbackURL: 'https://playmate-zmirnoff.c9users.io/',
    profileFields: ['emails','birthday']
};

var fbCallback = function(accesToken, refreshToken, profile, cb) {
    console.log(accesToken, refreshToken, profile);
}

passport.use(new facebookStrategy(fbOptions, fbCallback));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email','birthday'] }));
///ROUTES////////////////////////////////////////////////////

app.get('/', dataAcess.isLoggedIn, function(req, res) {
    res.render("index");
});

app.get('/main', function(req, res) {
    res.render("index");
});


//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function() {
    console.log('The server is running on port ' + process.env.PORT + ' and ip ' + process.env.IP);
});
