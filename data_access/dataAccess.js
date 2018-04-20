var mongoose = require("mongoose"),
    passport = require("passport"),
    express  = require("express"),
    app      = express(),
    fs       = require("fs"),
    upload   = require("./imgUpload");
    
mongoose.connect("mongodb://localhost/playmate");

//MODELS----------------------------
var models  = require("./schemas");
var User    = models.user;
var Group   = models.group;
var Event   = models.event;

//SETTINGS--------------------------


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
    console.log('saved content');
    user.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("saved to DB");
        }
    });
}

function getUserFromDB(user, cb)
{
    User.findById(user._id, function(err, user){
       if(err)
       {
           console.log(err);
       }
       else{
           console.log('found the user');
           cb(user);
       }
    });
}

function saveImageToDB(user, uploadedImage)
{
    console.log(uploadedImage);
    user.image = "images/"+uploadedImage.filename
    console.log('saved image');
}

function saveGroupToDB(group, cb){
    Group.create({
        name: group.name,
        type: group.type,
        dayOfActivity: group.day,
        timeOfActivity: group.time,
        location: group.location,
        minParticipants: group.minParticipants,
        maxParticipants: group.maxParticipants,
        level: group.level,
    }, function(err, group){
      if(err){
          console.log('failed creating group');
      }else{
          console.log('group created');
          cb(group);
      }
    })
}

function associateGroupToUser(group, user){
        user.groups.push(group._id);
        group.participants.push(user._id);
        user.save(function(err){
            if(err){
                console.log('associating group failed');
            }else{
                console.log('associating group succeeded');
            }
        })
}

function saveEventToDB(event, cb){
    Event.create({
         name: event.name,
         location: event.location, //The location URI
         maxNumOfParticipants: event.maxNumOfParticipants,
         minNumOfParticipants: event.minNumOfParticipants,
         dateOfCreation: Date.now(),
         dateOfEvent: event.date,
         timeOfActivity: event.time,
         sportType: event.type,
         level: event.minLevel, // From beginner to expert
         gameLevel: 0,//The individual score
         agesRange: "0 - 99", // Ages of the participates
    }, function(err, event){
      if(err){
          console.log('failed creating event');
      }else{
          console.log('event created');
          cb(event);
      }
    })
}

function associateEventToUser(event, user){
        user.events.push(event._id);
        event.participants.push(user._id);
        user.save(function(err){
            if(err){
                console.log('associating event failed');
            }else{
                console.log('associating event succeeded');
            }
        })
}

function isLoggedIn( req, res, next){
     if(req.isAuthenticated()){
         res.locals.user = req.user; 
         return next();
    }
    else{
        console.log("redirecting to login...");
        res.redirect('/login');
    }
}

function getEventsFromUser(user, cb){
    User.findById(user._id, function(err, user){
       if(err){
           console.log(err);
       }else{
           var eventsArr = [];
           user.events.forEach(function(event){
               Event.findById(event,function(err, foundEvent){
                   if(err){
                       console.log(err);
                   }else{
                    eventsArr.push(foundEvent);   
                    console.log(foundEvent);

                   }
               });
           })
           cb(eventsArr);
       }
    });
}

function getGroupsFromUser(user, cb){
    User.findById(user._id, function(err, user){
       if(err){
           console.log(err);
       }else{
           var groupsArr = [];
           user.groups.forEach(function(event){
               Event.findById(event,function(err, foundGroup){
                   if(err){
                       console.log(err);
                   }else{
                    groupsArr.push(foundGroup);
                    console.log(foundGroup);
                   }
               });
           })
           cb(groupsArr);
       }
       });
    };



//FUNCTIONS OBJECT TO EXPORT-------------------
var funcs = {
                saveUserToDB: saveUserToDB,
                isLoggedIn: isLoggedIn,
                saveGroupToDB: saveGroupToDB,
                saveImageToDB: saveImageToDB,
                getUserFromDB: getUserFromDB,
                associateGroupToUser: associateGroupToUser,
                saveEventToDB: saveEventToDB,
                associateEventToUser: associateEventToUser,
                getEventsFromUser: getEventsFromUser,
                getGroupsFromUser: getGroupsFromUser
             }

//EXPORT---------------------------------------
module.exports = funcs; 