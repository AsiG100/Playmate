const dataAccess = require("../data_access/dataAccess.js");

function addSuggestedContentToFeed(userID, res, cb){
       res.locals.friendsEvents = [];
       res.locals.friendsGroups = [];

    dataAccess.getUserFromDB({_id: userID}, function(user){
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
     
      dataAccess.getUserContent(userID, function(groups, events){
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

module.exports = {
    addSuggestedContentToFeed: addSuggestedContentToFeed,
    addYourContentToFeed: addYourContentToFeed
}

