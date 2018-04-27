var express = require("express"),
    app = express(),
    request = require("request"),
    ejs     = require("ejs"),
    imageConvert = require("image-convert"),
    bodyParser = require('body-parser'),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    facebookStrategy = require("passport-facebook").Strategy,
    upload           = require("./data_access/imgUpload"),
    User = require("./data_access/schemas.js").user;
//FILES
var dataAcess = require("./data_access/dataAccess.js");

//SETTINGS---------------------------------------------
app.set('view engine', 'ejs');
app.set('views', "./views");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/public'));
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
    console.log(details);
    var newUser = new User({username: details.username});
    User.register(newUser, details.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("register");
        }
        else {
            dataAcess.saveUserToDB(user, details);
            if(uploadedImage){
                dataAcess.saveImageToDB(user, uploadedImage);
            }
            req.login(user, function(err) {
                if (err) {
                console.log(err);
                }
            return res.redirect('/');
            });
            }
        });
    });

var uploadedImage;
app.post('/upload', function(req, res){
    upload(req, res, function(err) {
         if (err) {
              console.log("Something went wrong!");
         }
         console.log("File uploaded sucessfully!.");
         console.log(req.file);
         uploadedImage = req.file;
     });
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/'
        // failureRedirect: '/login'
    }),
    function(req, res) {
        console.log("redirecting home...");
        res.redirect('/');

    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});
///FACEBOOK AUTH/////////////////////////////////////////////
var FACEBOOK_APP_ID = '282940592244352',
    FACEBOOK_SECRET = 'ce4b31f6295d761776bb325df2d2ab7a';
    
passport.use(new facebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_SECRET,
    callbackURL: 'https://playmate-zmirnoff.c9users.io/auth/facebook/callback',
    profileFields: ['emails','friends','birthday','name','picture']
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      process.nextTick(function(){
        User.findOne({ 'facebook.id': profile.id }, function (err, user) {
            if(err)
            {
                done(err);
            }
            if(user)
            {
                console.log("Auth done");
                done(null, user);
            }else{
                var newUser = new User();
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.image = "https://graph.facebook.com/"+profile.id+"/picture?type=large";
                newUser.username = profile.name.givenName +" "+profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.birthDate = profile._json.birthday;
                newUser.gameProgress = 0;
                newUser.save();
                console.log(newUser);
                done(null, newUser);

            }
        });
    })
  }
));

app.get('/auth/facebook' ,passport.authenticate('facebook', {authType: 'rerequest',
                         scope: ['email','user_friends','user_birthday','public_profile'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('Successful authentication, redirect home.');
    res.redirect('/');
  });

///ROUTES////////////////////////////////////////////////////


app.get('/', dataAcess.isLoggedIn, function(req, res) {
        dataAcess.getUserContentAndRender(req.user, res, function(){
            res.render('index');
        });
        dataAcess.getFavoritesFromFB(req.user);
});

app.get('/groups/add',dataAcess.isLoggedIn, function(req, res) {
    res.render('addGroup');
});

app.post('/groups',dataAcess.isLoggedIn, function(req, res){
    var groupDetails = req.body.group;
    dataAcess.saveGroupToDB(groupDetails, function(group){
        User.findById(req.user._id, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            console.log("found user");
            dataAcess.associateGroupToUser(group, user);
            group.admin = user._id;
            group.save();
        }
    });
    res.redirect("/");  
    });
    
});

app.get('/groups/:id/edit',dataAcess.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getGroupFromDB(id, function(group){
            res.render('editGroup',{group:group});    
    });
});

app.get('/events/add',dataAcess.isLoggedIn, function(req, res) {
    res.render('addEvent');
});

app.post('/events', function(req, res) {
    var eventDetails = req.body.event;
    dataAcess.saveEventToDB(eventDetails, function(event){
         User.findById(req.user._id, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            dataAcess.associateEventToUser(event, user);
            event.admin = user._id;
            event.save();
        }});
        res.redirect('/');
    })
});

app.get('/events/:id/edit',dataAcess.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getEventFromDB(id, function(event){
            res.render('editEvent',{event:event});    
    });
});

app.get('/profile/:id',dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getUserContentAndRender(id, res, function(user){
        res.render('profile',{profile:user});
    });
});
//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function() {
    console.log('The server is running on port ' + process.env.PORT + ' and ip ' + process.env.IP);
});
