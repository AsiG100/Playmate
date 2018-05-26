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

function getAllRelevantTracksForSearch(search, userID, cb){
    //gets the releant tracks decided upon the distance between the users and the sport type
    var relevants = [];

    dataAccess.getAllTracksForSearch(search, function(tracks){
       tracks.forEach(function(track){
            relevants.push(track.user);
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
///////////////////////////////////////////
module.exports = {
    addSuggestedContentToFeed: addSuggestedContentToFeed,
    addYourContentToFeed: addYourContentToFeed,
    getAllRelevantTracksForSearch: getAllRelevantTracksForSearch,
    showSearchedContent: showSearchedContent,
    showSearchedContentWithName: showSearchedContentWithName
}

