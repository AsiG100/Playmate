const dataAccess = require("../data_access/dataAccess.js"),
      sportTypes = require("../data_access/schemas.js").sportTypes,
      request    = require("request");


//SMART FEED/////////////////////////////////////
function addSuggestedContentToFeed(userID, res, cb){
       res.locals.friendsEvents = [];
       res.locals.friendsGroups = [];

    dataAccess.getUserFromDB({_id: userID}, function(user){
       if(user.favoriteUsers.length > 0){
                user.favoriteUsers.forEach(function(friendID){
                dataAccess.getUserContent(friendID, function(user, groups, events){
                  groups.forEach(function(group){
                     if(group.participants.indexOf(user._id) == -1)
                     {
                        console.log('add: %s',group);
                        res.locals.friendsGroups = res.locals.friendsGroups.concat(group);
                        res.locals.friendsGroups.sort(sortByDate);
                    
                     } 
                  });
                  events.forEach(function(event){
                     if(isEventPassed(event.dateOfEvent) && event.participants.indexOf(user._id) == -1)
                     {
                        console.log('add: %s',event);
                        res.locals.friendsEvents = res.locals.friendsEvents.concat(event);
                        res.locals.friendsEvents.sort(sortByDate);
                     }
                  });
              });
           });
       }else{
            res.locals.friendsEvents = [];
            res.locals.friendsGroups = [];
       }
       
       cb();
    });
}

function addYourContentToFeed(userID, res, cb){
        res.locals.events = [];
        res.locals.groups = [];
     
      dataAccess.getUserContent(userID, function(user, groups, events){
        groups.forEach(function(group){
                console.log('add: %s',group);
                res.locals.groups = res.locals.groups.concat(group);
                res.locals.groups.sort(sortByDate);
          });
          events.forEach(function(event){
             if(isEventPassed(event.dateOfEvent))
             {
                console.log('add: %s',event);
                events.push(event);  
                res.locals.events = res.locals.events.concat(event);
                res.locals.events.sort(sortByDate);
             }
          });
        
        cb();
       });
    }    

function sortByDate(a, b){
      return b.dateOfCreation - a.dateOfCreation;  
}

function isEventPassed(date){
    var now = Date.now(),
        due = Date.parse(date) + 86400000;
        
        return due > now;
}

//SMART GROUP CREATION/////////////////////
/*
    This service tracks the users searches and fit a group that suits for the participants
    based on their interests and people they follow
*/

function getAllRelevantTracksForType(type, cb){
    //gets the releant tracks decided upon the distance between the users and the sport type
    var relevants = [];
    var hasGroup = false;
    dataAccess.getAllTracksForType(type, function(tracks){
       tracks.forEach(function(track){
            track.groups.forEach(function(group){
                if(group.sportType == type){
                    hasGroup = true;
                }
            });
            
            if(hasGroup == false){
                relevants.push(track);
            }
       });
      cb(relevants); 
    });
}

function getFriendsInRelevantTracks(userID, type){
    var group = [];
    var userSent;
    
    dataAccess.getUserFromDB({_id: userID}, function(user){
        userSent = user;        
    });
    
    getAllRelevantTracksForType(type, function(relevants){
       relevants.forEach(function(relevant){
            if(userSent.favoriteUsers.indexOf(relevant.user) != -1){
                group.push(relevant);
            }
       });
       return group;
    });
}

function hasSearched(userID, type){
    getAllRelevantTracksForType(type, function(relevants){
        relevants.forEach(function(relevant){
           if(relevant.user == userID){
               return true;
           } 
        });
        
        return false;
    });
}

function getOffersOfCreationToUser(userID){
    //get user and offer him users to create a group for a type
    var recommandations = [];
    
    sportTypes.forEach(function(type){
        if(hasSearched(userID, type)){
            var group = getFriendsInRelevantTracks(userID, type);
            recommandations.push({
                type: type,
                group: group
            });
        }
    });
    
    return recommandations;
}

///////////////////////////////////////////
module.exports = {
    addSuggestedContentToFeed: addSuggestedContentToFeed,
    addYourContentToFeed: addYourContentToFeed,
    getOffersOfCreationToUser: getOffersOfCreationToUser
}

