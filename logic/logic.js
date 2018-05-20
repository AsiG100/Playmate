const dataAccess = require("../data_access/dataAccess.js");

function addSuggestedContentToFeed(userID, res, cb){
    var friendsEvents = [],
        friendsGroups = [];
        res.locals.friendsEvents = [];
        res.locals.friendsGroups = [];

    dataAccess.getUserFromDB({_id: userID}, function(user){
       var friendsAmount = user.favoriteUsers.length;
       if(user.favoriteUsers.length > 0){
                user.favoriteUsers.forEach(function(friendID){
                dataAccess.getUserContent(friendID, function(groups, events){
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
                        friendsEvents.push(event);  
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
      dataAccess.getUserContent(userID, function(groups, events){
        res.locals.events = events;
        res.locals.events.sort(sortByDate);
        res.locals.groups = groups;
        res.locals.groups.sort(sortByDate);
        
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

module.exports = {
    addSuggestedContentToFeed: addSuggestedContentToFeed,
    addYourContentToFeed: addYourContentToFeed
}

