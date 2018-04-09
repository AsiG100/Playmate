var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/playmate");

//MODELS----------------------------
var models = require("./schemas");
var User = models.user;

//FUNCTIONS-------------------------
function saveUserToDB(userDetails)
{
    User.create({
        name: userDetails.name,
        password: userDetails.password,
        birthDate: userDetails.birthDate,
        address: 
            {
                country: userDetails.country,
                city: userDetails.city,
                street: userDetails.street,
                streetNum:userDetails.streetNum
            },
        gameProgress: 0,
        image: userDetails.image,
        sportTypes: [],
        groups: [],
        favoriteUsers: [],
        preferences: []
        
    }, function(err, user){
    if(err){
        console.log(err);
    }else{
        console.log('succeded to save user to DB:');
        console.log(user);
    }
});
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

//FUNCTIONS OBJECT TO EXPORT-------------------
var funcs = {
                saveUserToDB: saveUserToDB,
                getUserFromDB: getUserFromDB
             }

//EXPORT---------------------------------------
module.exports = funcs; 