var mongoose = require("mongoose"),
    passport = require("passport"),
    express  = require("express"),
    request  = require("request"),
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
    user.image = "/images/"+uploadedImage.filename
    console.log('saved image');
}

function saveGroupToDB(group, cb){
    Group.create({
        dateOfCreation: Date.now(),
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

function getGroupFromDB(id, cb){
    Group.findById(id, function(err, group) {
       if(err){
           console.log(err);
       }else{
           console.log('group retrieved');
           cb(group);
       }
    });
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

function getEventFromDB(id, cb){
    Event.findById(id, function(err, event) {
       if(err){
           console.log(err);
       }else{
           console.log('event retrieved');
           cb(event);
       }
    });
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

function getUserContentAndRender(userId, res, cb){
        User.findById(userId).populate("groups").exec(function(err, user){
            if(err){
                console.log(err);
            }
            else{
                console.log('sent user groups');
                res.locals.groups = user.groups;
                //sort by time of creation
                res.locals.groups.sort(function(a,b){
                  return b.dateOfCreation - a.dateOfCreation;  
                });
                User.findById(user).populate('events').exec(function(err, user){
                   if(err){
                       console.log(err);
                   } else{
                       console.log('sent user events');
                       res.locals.events = user.events;
                       //sort by time of creation
                       res.locals.events.sort(function(a,b){
                          return b.dateOfCreation - a.dateOfCreation;  
                       });
                       cb(user);
                   }
                });
            }
        });
}

function updateEventInDB(eventID,updatedData){
    Event.findById(eventID, function(err, event){
       if(err){
           console.log(err);
       }else{
         event.name = updatedData.name;
         event.location = updatedData.location; //The location URI
         event.maxNumOfParticipants = updatedData.maxNumOfParticipants;
         event.minNumOfParticipants = updatedData.minNumOfParticipants;
         event.dateOfEvent = updatedData.date;
         event.timeOfActivity = updatedData.time;
         event.sportType = updatedData.type;
         event.level = updatedData.minLevel; // From beginner to expert
         event.agesRange = "0 - 99"; // Ages of the participates
         event.save(function(err){
             if(err){
                 console.log(err);
             }else{
                 console.log('event updated');
             }
         });
       }
    });
}

function updateGroupInDB(groupID,updatedData){
    Group.findById(groupID, function(err, group){
       if(err){
           console.log(err);
       }else{
            group.name = updatedData.name;
            group.type = updatedData.type;
            group.dayOfActivity = updatedData.day;
            group.timeOfActivity = updatedData.time;
            group.location = updatedData.location;
            group.minParticipants = updatedData.minParticipants;
            group.maxParticipants = updatedData.maxParticipants;
            group.level = updatedData.level;
            group.save(function(err){
             if(err){
                 console.log(err);
             }else{
                 console.log('group updated');
             }
         });
       }
    });
}

function deleteEventFromDB(eventID){
    Event.findByIdAndRemove(eventID, function(err){
        if(err){
            console.log(err);
        }else{
            console.log('event removed');
        }
    })
}

function deleteGroupFromDB(groupID){
    Event.findByIdAndRemove(groupID, function(err){
        if(err){
            console.log(err);
        }else{
            console.log('group removed');
        }
    })
}

//after some other user will login with facebook
function getFavoritesFromFB(user){
    request('https://graph.facebook.com/v2.12/me?access_token='+user.facebook.token+'&fields=friends', function (err, res, body) {
        if(err){
            console.log(err);
        }else{
            console.log('body:', body); // Print the HTML for the Google homepage.
        }});
}

//FUNCTIONS OBJECT TO EXPORT-------------------
var funcs = {
                saveUserToDB: saveUserToDB,
                isLoggedIn: isLoggedIn,
                saveGroupToDB: saveGroupToDB,
                getGroupFromDB: getGroupFromDB,
                saveImageToDB: saveImageToDB,
                getUserFromDB: getUserFromDB,
                associateGroupToUser: associateGroupToUser,
                saveEventToDB: saveEventToDB,
                getEventFromDB: getEventFromDB,
                associateEventToUser: associateEventToUser,
                getUserContentAndRender: getUserContentAndRender,
                updateEventInDB: updateEventInDB,
                updateGroupInDB: updateGroupInDB,
                deleteEventFromDB: deleteEventFromDB,
                deleteGroupFromDB: deleteGroupFromDB,
                getFavoritesFromFB: getFavoritesFromFB
             }

//EXPORT---------------------------------------
module.exports = funcs; 