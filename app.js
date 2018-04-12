var express    = require("express"),
    app        = express(),
    request    = require("request"),
    bodyParser = require('body-parser'),
    passport   = require("passport"),
    localStrategy = require("passport-local"),
    User        = require("./data_access/schemas.js").user;
//FILES
var dataAcess = require("./data_access/dataAccess.js");
    
//SETTINGS---------------------------------------------
app.set('view engine', 'ejs');
app.set('views', "./views");
app.use(bodyParser.urlencoded({extended:true}));
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
 app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
 });

//AUTH ROUTES/////////////////////////////////////////////////

app.get('/register', function(req, res) {
    res.render("signUp");
});

app.post('/resgister', function(req, res){
  var newUser = new User(req.body.user);
  User.register(newUser, req.body.password, function(err, user){
      if(err)
      {
          console.log(err);
          res.redirect("register");
      }else{
          passport.authenticate("local")(req,res,function(){
              res.redirect("/");
          })
      }
  });
});

app.get('/login', function(req, res) {
    res.render('login'); 
});

app.post('/login',passport.authenticate("local",
{
    successRedired:'/',
    failureRedirect:'/login' 
    
}), function(req, res) {
});

app.get('/logout', function(req, res) {
   req.logout();
   res.redirect('/login');
});
///ROUTES////////////////////////////////////////////////////

app.get('/',dataAcess.isLoggedIn, function(req, res){
    res.render("index"); 
});

app.get('/main', function(req, res) {
   res.render("index"); 
});


//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('The server is running on port '+process.env.PORT+' and ip '+process.env.IP);
});