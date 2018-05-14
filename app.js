
var express = require("express"),
    app = express(),
    request = require("request"),
    ejs     = require("ejs"),
    flash   = require("connect-flash"),
    imageConvert = require("image-convert"),
    methodOverride = require("method-override"),
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
app.use(methodOverride('_method'));

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
app.use(flash());
//AUTH ROUTES/////////////////////////////////////////////////

app.get('/signup', function(req, res) {
    res.render("signUp",{image: undefined});
});

app.post('/signup', function(req, res) {
    var details = req.body.user;
    console.log(details);
    var newUser = new User({username: details.username});
    User.register(newUser, details.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/signup");
        }
        else {
            dataAcess.saveUserToDB(user, details);
            dataAcess.saveImageToDB(user, uploadedImage);
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
app.post('/imageUpload', function(req, res){
    upload(req, res, function(err) {
         if(err)
         {
              console.log(err);
         }else
         {
            console.log("File uploaded sucessfully!.");
            uploadedImage = req.file;
            res.render('signUp',{image: uploadedImage.filename});
         }
     });
});

app.post('/imageUpdate/:id', function(req, res){
    upload(req, res, function(err) {
         if(err)
         {
              console.log(err);
         }else
         {
            var id = req.params.id;
            dataAcess.getUserFromDB({_id:id}, function(user) {
                console.log("File uploaded sucessfully!.");
                uploadedImage = req.file;
                console.log(uploadedImage)
                res.render('editUser',{user: user, image: uploadedImage.filename});                
            })

         }
     });
});

app.get('/signup/:id/edit', function(req, res) {
   var id = req.params.id;
   dataAcess.getUserFromDB({_id:id}, function(user){
         res.render('editUser',{user:user, image: user.image || undefined});
    });
});

app.put('/signup/:id', function(req, res) {
    var id = req.params.id;
    var details = req.body.user;
    console.log('saving image...');
    if(uploadedImage){
        dataAcess.getUserFromDB({_id:id}, function(user) {
            dataAcess.saveImageToDB(user, uploadedImage);
        })
      }    
    console.log('waiting for the update');
    dataAcess.updateUserInDB(id, details, function(){
        res.redirect('/profile/'+id);        
    });
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/'
        // failureRedirect: '/login'
    }),
    function(req, res) {
        console.log("redirecting home...");
        req.flash('success','You are logged in!');
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
                User.findById(user._id, function(err, user) {
                    if(err){
                        console.log(err);
                    }else{
                        user.facebook.token = accessToken;
                        user.save(function(){
                            console.log('saved new token');
                        });
                    }
                });
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
    req.flash('success', 'You are logged in!');
    res.redirect('/');
  });

///ROUTES////////////////////////////////////////////////////


app.get('/', dataAcess.isLoggedIn, function(req, res) {
        dataAcess.getMyContent(req.user, res, function(){
            dataAcess.getUserFromDB(req.user, function(user) {
               dataAcess.getFriendsContent(user.favoriteUsers, res, function(){
                    res.render('index'); 
                });
            });
        });
        dataAcess.getFavoritesFromFB(req.user);
});

app.get('/groups/add', dataAcess.isLoggedIn, function(req, res) {
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

app.put('/groups/:id', function(req, res){
    var id = req.params.id;
    var group = req.body.group;
    dataAcess.updateGroupInDB(id,group); 
    res.redirect('/');
});

//-view a group
app.get('/groups/:id', dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getUserFromDB({_id:id}, function(user){
         res.render('viewGroup',{user:user});
    });
});

app.get('/groups/:id/edit',dataAcess.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getGroupFromDB(id, function(group){
            res.render('editGroup',{group:group});    
    });
});

app.delete('/groups/:id', function(req, res){
    var id = req.params.id;
    dataAcess.deleteGroupFromDB(id);
    res.redirect('/');
});

app.get('/events/add',dataAcess.isLoggedIn, function(req, res) {
    res.render('addEvent');
});

app.post('/events', dataAcess.isLoggedIn, function(req, res) {
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

app.put('/events/:id', function(req, res){
    var id = req.params.id;
    var event = req.body.event;
    dataAcess.updateEventInDB(id,event); 
    res.redirect('/');
});

//-view an event
app.get('/events/:id', dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getUserFromDB({_id:id}, function(user){
         res.render('viewEvent',{user:user});
    });
});

app.get('/events/:id/edit',dataAcess.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getEventFromDB(id, function(event){
            res.render('editEvent',{event:event});    
    });
});

app.delete('/events/:id', dataAcess.isLoggedIn, function(req, res){
    var id = req.params.id;
    dataAcess.deleteEventFromDB(id);
    res.redirect('/');
});

app.get('/profile/:id',dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getMyContent(id, res, function(user){
        res.render('profile',{profile:user});
    });
});

app.post('/friends/add', function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;
    
    dataAcess.addFavoriteFriendToDB(user, friend);
    res.redirect('back');
});

app.post('/friends/remove', function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;
    
    dataAcess.removeFavoriteFriendFromDB(user, friend);
    res.redirect('back');
});



//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function() {
    console.log('The server is running on port ' + process.env.PORT + ' and ip ' + process.env.IP);
});
