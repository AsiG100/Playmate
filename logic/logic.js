const dataAccess = require("../data_access/dataAccess.js"),
      sportTypes = require("../data_access/schemas.js").sportTypes,
      levels    = require("../data_access/schemas.js").levels,
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
                     if(group.participants.indexOf(userID) == -1)
                     {
                        console.log('add: %s',group);
                        res.locals.friendsGroups = res.locals.friendsGroups.concat(group);
                        res.locals.friendsGroups.sort(sortByDate);
                    
                     } 
                  });
                  events.forEach(function(event){
                     if(isEventPassed(event.dateOfEvent) && event.participants.indexOf(userID) == -1)
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

function getAllRelevantTracksForSearch(search, userID, cb){
    //gets the releant tracks decided upon the distance between the users and the sport type
    var relevants = [];

    dataAccess.getAllTracksForSearch(search, function(tracks){
       tracks.forEach(function(track){
            if(!track.user._id.equals(userID)){
                relevants.push(track);
            }
       });
    //TODO   dataAccess.deleteSearchedTracks(tracks);
      cb(relevants); 
    });
}


//Search results retrieval////////////////////////////////////////
function showSearchedContent(search, cb){
    dataAccess.getRelevantContent(search, function(content){
        var finalContent = content;
        var runnable = finalContent.slice();

            if(search.type.length > 0){
               runnable.forEach(function(element){
                    if(element.sportType != search.type){
                        var index = finalContent.indexOf(element);
                        finalContent.splice(index, 1);                    
                    }        
               });
            }
            runnable = finalContent.slice();
            if(search.district.length > 0){
               runnable.forEach(function(element){
                    if(element.district != search.district){
                        var index = finalContent.indexOf(element);
                        finalContent.splice(index, 1);                    
                    }                                
               });
            }
            runnable = finalContent.slice();
            if(search.level.length > 0){
              runnable.forEach(function(element){
                    console.log(finalContent.length,element.name,element.level,search.level);        
                    if(element.level != search.level){
                        var index = finalContent.indexOf(element);
                        finalContent.splice(index, 1);                    
                    }                                
              });
            }
        cb(finalContent);
    });
}

function showSearchedContentWithName(search, cb){
        dataAccess.getContentByName(search.name, search.contentType, function(content){
                
        var finalContent = content;
        var runnable = finalContent.slice();

            if(search.type.length > 0){
               runnable.forEach(function(element){
                    if(element.sportType != search.type){
                        var index = finalContent.indexOf(element);
                        finalContent.splice(index, 1);                    
                    }        
               });
            }
            runnable = finalContent.slice();
            if(search.district.length > 0){
               runnable.forEach(function(element){
                    if(element.district != search.district){
                        var index = finalContent.indexOf(element);
                        finalContent.splice(index, 1);                    
                    }                                
               });
            }
            runnable = finalContent.slice();
            if(search.level.length > 0){
              runnable.forEach(function(element){
                    console.log(finalContent.length,element.name,element.level,search.level);        
                    if(element.level != search.level){
                        var index = finalContent.indexOf(element);
                        finalContent.splice(index, 1);                    
                    }                                
              });
            }
        cb(finalContent);
        });
}

//GAMIFICATION//////////////////////////

function getLevelIndex(level, cb){
    levels.forEach(function(element){
       if(element.name == level){
           cb(element.index);
       } 
    });
}

function compareLevelWithGroup(user,group, cb){
    dataAccess.getUserFromDB({_id: user}, function(user){
        dataAccess.getGroupFromDB(group, function(group){
           getLevelIndex(group.level, function(groupLevelIndex){
                    cb(user.level.index >= groupLevelIndex);                   
           });
        });
    });   
}

function compareLevelWithEvent(user,event, cb){
    dataAccess.getUserFromDB({_id: user}, function(user){
        dataAccess.getEventFromDB(event, function(event){
           getLevelIndex(event.level, function(eventLevelIndex){
                    cb(user.level.index >= eventLevelIndex);                   
           });
        });
    });   
}

///////////////////////////////////////////
module.exports = {
    addSuggestedContentToFeed: addSuggestedContentToFeed,
    addYourContentToFeed: addYourContentToFeed,
    getAllRelevantTracksForSearch: getAllRelevantTracksForSearch,
    showSearchedContent: showSearchedContent,
    showSearchedContentWithName: showSearchedContentWithName,
    compareLevelWithEvent: compareLevelWithEvent,
    compareLevelWithGroup: compareLevelWithGroup
}

