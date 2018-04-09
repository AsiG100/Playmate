var express    = require("express"),
    app        = express(),
    request    = require("request"),
    bodyParser = require('body-parser'),
    passport   = require("passport"),
    localStrategy = require("passport-local");
    // User        = require("./data_access/schemas.js");
    
//FILES
//var dataAcess = require("./data_access/dataAccess.js");
    
//SETTINGS---------------------------------------------
app.set('view engine', 'ejs');
app.set('views', "./views");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

//PASSPORT CONFIG/////////////////////////////
// app.use(require("express-session")({
//     secret: "something",
//     resave: false,
//     saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

///ROUTES////////////////////////////////////////////////////
    
app.get('/', function(req, res){
    res.render("login");
});

app.get('/register', function(req, res){
    res.render("signUp");
});

app.get('/main', function(req, res){
    res.render("index"); 
});

//AUTH ROUTES/////////////////////////////////////////////////

// app.get('/register', function(req, res) {
//     res.render("register");
// });

// app.post('/resgister', function(req, res){
//   var newUser = new User({username: req.body.name});
//   User.register(newUser, req.body.password, function(err, user){
//       if(err)
//       {
//           console.log(err);
//           res.redirect("register");
//       }else{
//           passport.authenticate("local")(req,res,function(){
//               res.redirect("/");
//           })
//       }
//   });
// });


//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('The server is running on port '+process.env.PORT+' and ip '+process.env.IP);
});