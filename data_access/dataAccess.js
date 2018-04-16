var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/playmate");

//MODELS----------------------------
var models = require("./schemas");
var User = models.user;

//FUNCTIONS-------------------------
function saveUserToDB(user, userDetails)
{
    user.email = userDetails.email;
    user.birthDate = userDetails.dateOfBirth;
    user.address = {
        city: userDetails.city,
        street: userDetails.street,
        streetNum: userDetails.number
    };
    user.gameProgress= 0;
    user.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("saved to DB");
        }
    });
        
        //image: userDetails.image,
}



function getUserFromDB(){
    User.find({}, function(err, users){
        if(err)
        {
            console.log("There was an error:");
            console.log(err);
        }else{
            return users;   
        }
    });    
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
         console.log(req.body.user);
         return next();
    }
    else{
        console.log("user is not logged in");
        res.redirect('login');
    }
}

// function checkOwnership(req, res, next){
//     if(req.isAuthenticated()){
        
//     }else{
        
//     }
// }

//FUNCTIONS OBJECT TO EXPORT-------------------
var funcs = {
                saveUserToDB: saveUserToDB,
                getUserFromDB: getUserFromDB,
                isLoggedIn: isLoggedIn
             }

//EXPORT---------------------------------------
module.exports = funcs; 