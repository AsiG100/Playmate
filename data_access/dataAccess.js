var mongoose = require("mongoose"),
    passport = require("passport"),
    express  = require("express"),
    request  = require("request"),
    app      = express(),
    fs       = require("fs"),
    upload   = require("./imgUpload");
    
// mongoose.connect("mongodb://localhost/playmate");
mongoose.connect("mongodb://playmate:playmate@ds117730.mlab.com:17730/playmate");

//MODELS----------------------------
var models  = require("./schemas");
var User    = models.user;
var Group   = models.group;
var Event   = models.event;
var Track   = models.track;
var Message = models.Message;


//GETS AND SAVES/////////////////////////////////
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
    if(uploadedImage){
        user.image = "/images/"+uploadedImage.filename;
        }
        else
        {
        user.image = "/images/blank-profile.png";
    }
    user.save();
    console.log('saved image');
}

function saveGroupToDB(group, cb){
    Group.create({
        dateOfCreation: Date.now(),
        name: group.name,
        sportType: group.type,
        days: group.days,
        time: group.time,
        location: group.location,
        minParticipants: group.minParticipants,
        maxParticipants: group.maxParticipants,
        level: group.level,
    }, function(err, savedGroup){
      if(err){
          console.log('failed creating group');
      }else{
          console.log('group created');
          cb(savedGroup);
      }
    })
}

function getGroupFromDB(id, cb){
    Group.findById(id)
    .populate('participants')
    .populate('events')
    .populate('messages')
    .exec(function(err, group){
       if(err){
           console.log(err);
       }else{
           console.log('group retrieved');
           cb(group);
       }
    });
}

function associateGroupToUser(group, user){
    console.log(group);
        user.groups.push(group._id);
        group.participants.push(user._id);
        group.save();
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
         timeOfActivity:{
             startTime: event.startTime,
             endTime: event.endTime,
         },
         sportType: event.type,
         level: event.minLevel, // From beginner to expert
         gameLevel: 0,//The individual score
         group: event.groupID
    }, function(err, savedEvent){
      if(err){
          console.log(err);
      }else{
          console.log('event created');
          cb(savedEvent);
      }
    })
}

function getEventFromDB(id, cb){
    Event.findById(id)
    .populate('participants')
    .populate('messages')
    .exec(function(err, event) {
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
        event.save();
        user.save(function(err){
            if(err){
                console.log('associating event failed');
            }else{
                console.log('associating event succeeded');
            }
        })
}

function associateEventToGroup(event, groupID){
        Event.findById(event._id, function(err, event) {
            if(err){
                console.log(err);
            }else{
                event.group = groupID;
                event.save(function(){
                    console.log('saved group in event');
                });
            }
        });
        
        Group.findById(groupID, function(err, group) {
            if(err){
                console.log(err);
            }else{
                group.events.push(event._id);
                group.save(function(){
                console.log('associated event to group');
                });
            }
            });            
}

function getUserContent(userId, cb){
        User.findById(userId)
        .populate("groups")
        .populate("events")
        .exec(function(err, user){
            if(err){
                console.log(err);
            }
            else{
                console.log('sent groups and events');
                cb(user, user.groups, user.events);
            }
        });
}

function getContentByName(name, contentType, cb){
    if(contentType == 'Event'){
        Event.find({name: name}, function(err, events){
           if(err){
               console.log(err);
           } 
           else{
               console.log(events);
               cb(events);
           }
        });
    }
    else if(contentType == 'Group'){
        Group.find({name: name}, function(err, groups){
           if(err){
               console.log(err);
           } 
           else{
               console.log(groups);
               cb(groups);
           }
        });
    }
    else{
        User.find({username: name}, function(err, users){
           if(err){
               console.log(err);
           } 
           else{
               console.log(users);
                cb(users);
           }
        });
     }          
}

function getRelevantContent(search, cb){
    if(search.contentType == 'Event' || search.contentType == 'Group' ){
        if(search.contentType == 'Event'){
            Event.find(function(err, events){
               if(err){
                   console.log(err);
               } 
               else{
                   cb(events);
               }
            });
        }
        else if(search.contentType == 'Group'){
            Group.find(function(err, groups){
               if(err){
                   console.log(err);
               } 
               else{
                   cb(groups);
               }
            });
        }
        
    }
        else{
            User.find(function(err, users){
               if(err){
                   console.log(err);
               } 
               else{
                   cb(users);
               }
            });
         }    
}

//UPDATING////////////////////////////////////////////////  
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


function updateUserInDB(userID,updatedData, cb){
    User.findById(userID, function(err, user){
       if(err){
           console.log(err);
       }else{
            user.username = updatedData.username;
            user.email  = updatedData.email;
            user.birthDate = updatedData.dateOfBirth;
            user.address.city = updatedData.city;
            user.address.street = updatedData.street;
            user.address.streetNum = updatedData.number;
            user.save(function(err){
             if(err){
                 console.log(err);
             }else{
                 console.log('user updated');
                 cb();
             }
         });
       }
    });
}


//DELETES//////////////////////////////////////////////////////////

function deleteEventFromDB(eventID){
    Event.findById(eventID)
    .populate("participants")
    .exec (function(err, event) {
        if(err){
            console.log(err);
        }else{
            event.participants.forEach(function(user){
               var index = user.events.indexOf(eventID);
               console.log('the index is: ',index);
                if (index > -1) {
                  var removed = user.events.splice(index, 1);
                  user.save();
                  console.log('event removed from user: ',removed);
                }
            });
            
            if(event.group != undefined){
                Group.findById(event.group, function(err, group){
                    if(err){
                        console.log(err);
                    }else{
                           var index = group.events.indexOf(eventID);
                           var removed = group.events.splice(index, 1);
                           group.save();
                           console.log('event removed from group: ',removed);                   
                    }
                    });
            }
                        
            event.remove(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('event removed');
                }
            });
        }
    });    
}

function deleteGroupFromDB(groupID){
    Group.findById(groupID)
    .populate("participants")
    .exec(function(err, group) {
        if(err){
            console.log(err);
        }else{
            console.log(group);
            group.participants.forEach(function(user){
               var index = user.groups.indexOf(groupID);
               console.log('the index is: ',index);
                if (index > -1) {
                  var removed = user.groups.splice(index, 1);
                  user.save();
                  console.log('group removed from user: ',removed);
                }
            });
            
            group.remove(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('group removed');
                }
            });
        }
    });
}

//ASSOCIATIONS///////////////////////////////////////

function getFavoritesFromFB(user){
    request('https://graph.facebook.com/v2.12/me?access_token='+user.facebook.token+'&fields=friends', function (err, res, body) {
        if(err){
            console.log(err);
        }else{
            console.log('body:', body); // Print the HTML for the Google homepage.
        }});
}

function addFavoriteFriendToDB(user, friend){
    User.findById(user, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            User.findById(friend, function(err, friend) {
                if(err){
                    console.log(err);
                }else
                {
                    user.favoriteUsers.push(friend);
                    user.save();
                    console.log('a friend added to the DB');
                }
            });
        }
    });
}

function removeFavoriteFriendFromDB(user, friend){
    User.findById(user, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            User.findById(friend, function(err, friend) {
                if(err){
                    console.log(err);
                }else
                {
                    var index = user.favoriteUsers.indexOf(friend._id);
                    user.favoriteUsers.splice(index, 1);
                    user.save();
                    console.log('a friend removed from the DB');
                }
            });
        }
    });
}

function addEventToUserDB(user, event){
    User.findById(user, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            user.events.push(event);
            Event.findById(event, function(err, event) {
               if(err){
                   console.log(err);
               }else{
                event.participants.push(user._id); 
                event.save();
                user.save(function(){
                    console.log('event added to user');
                });            
           }});
        }
    });   
}

function removeEventFromUserDB(user, event){
   console.log('removing');
    User.findById(user, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            var index = user.events.indexOf(event);
            user.events.splice(index, 1);
            user.save();
            
            Event.findById(event, function(err, event){
                if(err){
                    console.log(err);
                }else{
                    var index = event.participants.indexOf(user._id);
                    event.participants.splice(index, 1);
                    event.save();
                    user.save(function(){
                        console.log('event removed from user DB');
                    });
                    
            }});
        }
    }); 
}

function addGroupToUserDB(user, group){
    User.findById(user, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            user.groups.push(group);
         Group.findById(group, function(err, group) {
               if(err){
                   console.log(err);
               }else{
                group.participants.push(user._id); 
                group.save();
                user.save(function(){
                console.log('group added to user');
                });            
           }});
        }
    });   
}


function removeGroupFromUserDB(user, group){
    User.findById(user, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            var index = user.groups.indexOf(group);
            user.groups.splice(index, 1);
            Group.findById(group, function(err, group){
                if(err){
                    console.log(err);
                }else{
                    var index = group.participants.indexOf(user._id);
                    group.participants.splice(index, 1);
                    group.save();
                    user.save(function(){
                    console.log('group removed from user');
                    }
                );
            }});
        }
    }); 
}

//TRACK SEARCHES///////////////////////////

function addTrackSearch(userID, search, cb){
    //add the user's search to the DB
        getSpecificSearch(userID, search, function(tracks){
            console.log(tracks);
            if(tracks.length == 0){
                Track.create({
                    user: userID,
                    sportType: search.type,
                    district: search.district,
                    level: search.level
                }, function(err, track){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('track added');
                        cb();
                    }
                 });            
            }
            
            cb();
        });
}

function getAllTracksForSearch(search, cb){
    console.log(search);
    Track.find({sportType: search.type, district: search.district, level: search.level})
    .populate('user')
    .exec(function(err, tracks){
       if(err){
           console.log(err);
       }else{
           console.log('Tracks retrieved');
            cb(tracks);
       }
    });
}

function getSpecificSearch(userID, search, cb){
    Track.find({user: userID, sportType: search.type, district: search.district, level: search.level}
    ,function(err, tracks){
       if(err){
           console.log(err);
       }else{
           console.log('Tracks retrieved');
            cb(tracks);
       }
    });
}

//MESSAGES////////////////////////////////////

function addMessageToGroup(groupID, message, cb){
    Group.findById(groupID, function(err, group) {
       if(err){
           console.log(err);
       } else{
           Message.create({
               image: message.image,
               name: message.name,
               content: message.content
           }, function(err, message){
                if(err){
                    console.log(err);
                } else{
                   group.messages.push(message);
                   group.save(function(){
                      console.log('message added');
                   });
                   cb();                    
                }              
           });
       }
    });
}

function addMessageToEvent(eventID, message, cb){
    Event.findById(eventID, function(err, event) {
       if(err){
           console.log(err);
       } else{
           Message.create({
               image: message.image,
               name: message.name,
               content: message.content
           }, function(err, message){
                if(err){
                    console.log(err);
                } else{
                   event.messages.push(message);
                   event.save(function(){
                      console.log('message added');
                   });
                   cb();                    
                }              
           });
       }
        
    });
}

//FUNCTIONS OBJECT TO EXPORT-------------------
var funcs = {
                saveUserToDB: saveUserToDB,
                saveGroupToDB: saveGroupToDB,
                getGroupFromDB: getGroupFromDB,
                saveImageToDB: saveImageToDB,
                getUserFromDB: getUserFromDB,
                associateGroupToUser: associateGroupToUser,
                saveEventToDB: saveEventToDB,
                getEventFromDB: getEventFromDB,
                associateEventToUser: associateEventToUser,
                associateEventToGroup: associateEventToGroup,
                getUserContent: getUserContent,
                getContentByName: getContentByName,
                getRelevantContent: getRelevantContent,
                updateEventInDB: updateEventInDB,
                updateGroupInDB: updateGroupInDB,
                updateUserInDB: updateUserInDB,
                deleteEventFromDB: deleteEventFromDB,
                deleteGroupFromDB: deleteGroupFromDB,
                getFavoritesFromFB: getFavoritesFromFB,
                addFavoriteFriendToDB: addFavoriteFriendToDB,
                removeFavoriteFriendFromDB: removeFavoriteFriendFromDB,
                addGroupToUserDB: addGroupToUserDB,
                removeGroupFromUserDB: removeGroupFromUserDB,
                addEventToUserDB: addEventToUserDB,
                removeEventFromUserDB: removeEventFromUserDB,
                addTrackSearch: addTrackSearch,
                getAllTracksForSearch: getAllTracksForSearch,
                addMessageToGroup: addMessageToGroup,
                addMessageToEvent: addMessageToEvent
             }

//EXPORT---------------------------------------
module.exports = funcs; 