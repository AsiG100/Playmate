let express = require("express"),
    router  = express.Router(),
    User    = require("./schemas.js").user,
    middlewares = require("./middlewares.js"),
    googleApi = require("../googleCalendar/googleAPI.js"),
    dataAcess = require("./dataAccess.js"),
    logic     = require("../logic/logic.js");

//INDEX//////////////////////////
router.get('/', middlewares.isLoggedIn, function(req, res) {
        // dataAcess.getMyContent(req.user, res, function(){
        //     dataAcess.getUserFromDB(req.user, function(user) {
        //       dataAcess.getFriendsContent(user.favoriteUsers, res, function(){
        //             res.render('index'); 
        //         });
        //     });
        // });
        // dataAcess.getFavoritesFromFB(req.user);
        var userID = req.user._id;
        
        logic.addSuggestedContentToFeed(userID, res, function(){
           logic.addYourContentToFeed(userID, res, function(){
              res.render('index'); 
           });
        });
});

router.get('/login', function(req, res) {
   res.render('login'); 
});

//GROUPS////////////////////////

router.get('/groups/add', middlewares.isLoggedIn, function(req, res) {
    res.render('addGroup');
});

router.post('/groups',middlewares.isLoggedIn, function(req, res){
    var groupDetails = req.body.group;
    dataAcess.saveGroupToDB(groupDetails, function(group){
        User.findById(req.user._id, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            console.log("found user");
            dataAcess.associateGroupToUser(group, user);
        }
    });
    req.flash('success','The group,'+group.name+' is added');
    res.redirect("/");  
    });
    
});

router.put('/groups/:id', function(req, res){
    var id = req.params.id;
    var group = req.body.group;
    dataAcess.updateGroupInDB(id,group); 
    req.flash('success','The group,'+group.name+' is updated');
    res.redirect('/');
});

router.get('/groups/:id', middlewares.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getGroupFromDB(id, function(group){
         res.render('viewGroup',{group:group});
    });
});

router.get('/groups/:id/edit',middlewares.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getGroupFromDB(id, function(group){
            res.render('editGroup',{group:group});    
    });
});

router.delete('/groups/:id', function(req, res){
    var id = req.params.id;
    dataAcess.deleteGroupFromDB(id);
    req.flash('success','The group is deleted');
    res.redirect('/');
});

router.get('/groups/:id/events/add', middlewares.isLoggedIn, function(req, res) {
    var id = req.params.id;
    res.render('addEvent',{groupID: id});
});

//EVENTS////////////////////////////
router.get('/events/add',middlewares.isLoggedIn, function(req, res) {
    res.render('addEvent',{groupID: undefined});
});

router.post('/events', middlewares.isLoggedIn, function(req, res) {
    var eventDetails = req.body.event;
    dataAcess.saveEventToDB(eventDetails, function(event){
         User.findById(req.user._id, function(err, user){
        if(err)
        {
            console.log(err);
        }else{
            dataAcess.associateEventToUser(event, user);
            if(eventDetails.groupID != undefined){
                console.log(eventDetails.groupID)
                dataAcess.associateEventToGroup(event, eventDetails.groupID);
            }
        }});
        req.flash('success','The event,'+event.name+' is added');
        res.redirect('/');
    })
});

router.put('/events/:id', function(req, res){
    var id = req.params.id;
    var event = req.body.event;
    dataAcess.updateEventInDB(id,event);
    req.flash('success','The event,'+event.name+' is updated');
    res.redirect('/');
});

//-view an event
router.get('/events/:id', middlewares.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getEventFromDB(id, function(event){
         res.render('viewEvent',{event: event});
    });
});

router.get('/events/:id/edit',middlewares.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getEventFromDB(id, function(event){
            res.render('editEvent',{event:event});    
    });
});

router.delete('/events/:id', middlewares.isLoggedIn, function(req, res){
    var id = req.params.id;
    dataAcess.deleteEventFromDB(id);
    req.flash('success','The event is deleted');
    res.redirect('/');
});

//PROFILE/////////////////////////

router.get('/profile/:id',middlewares.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getUserContent(id, function(user, groups, events){
        res.render('profile',{profile:user, groups:groups, events: events});
    });
});

//OBJECT ASSOCIATIONS///////////////

router.post('/friends/toggle', function(req, res) {
    var user = req.body.user,
        friend = req.body.friend,
        isAdded = req.body.isAdded;
        
    if(isAdded == 0){
        dataAcess.addFavoriteFriendToDB(user, friend);
        res.redirect('back');        
    }else{
    dataAcess.removeFavoriteFriendFromDB(user, friend);
    res.redirect('back');
    }
});

router.post('/event/toggle', function(req, res) {
    var user = req.body.user,
        event = req.body.event,
        isAdded = req.body.isAdded;
        
    if(isAdded == 0){
        dataAcess.addEventToUserDB(user, event);
        res.redirect('back');        
    }else{
        dataAcess.removeEventFromUserDB(user, event);
        res.redirect('back');            
    }
});

router.post('/group/toggle', function(req, res) {
    var user = req.body.user,
        group = req.body.group,
        isAdded = req.body.isAdded;
        
    if(isAdded == 0){
        dataAcess.addGroupToUserDB(user, group);
        res.redirect('back');        
    }else{
    dataAcess.removeGroupFromUserDB(user, group);
    res.redirect('back');
    }
});

//GOOGLE CALENDAR///////////////////////////

var syncedEvent;
var userID;

router.post('/syncToCalendar', function(req, res) {
    syncedEvent = req.body.event;
    userID = req.body.user;
         
    googleApi.syncEventToCalendar(syncedEvent, userID, function(url){
        if(url == undefined){
            req.flash('success', 'The event is synced');
            res.redirect('back');
        }else{
            res.redirect(url);
        }
        });
});

router.get('/googleCallback', function(req, res) {
    var code = req.query.code;
    googleApi.getAccessToken(code,function(auth){
        googleApi.syncEventToCalendar(syncedEvent, userID, function(){
            req.flash('success', 'The event is synced');
            res.redirect('back');
        });  
    });
});

//RESULTS/////////////////////////////////////////

router.post('/results', middlewares.isLoggedIn ,function(req, res) {
   var search = req.body.search;
    if(search.name.length > 0){
        logic.showSearchedContentWithName(search, function(content){
            if(search.contentType == 'Group' && content.length == 0){
                  dataAcess.addTrackSearch(req.user._id, search);
                  logic.getAllRelevantTracksForSearch(search, req.user._id, function(suggested){
                        res.render('results',{content: suggested, contentType: 'Track'});
                  });
            }else{
                res.render('results',{content: content, contentType: search.contentType});
            }
            });
    }else{
        logic.showSearchedContent(search, function(content){
            if(search.contentType == 'Group' && content.length == 0){
                  dataAcess.addTrackSearch(req.user._id, search);
                  logic.getAllRelevantTracksForSearch(search, req.user._id, function(suggested){
                        res.render('results',{content: suggested, contentType: 'Track'});                  
                      });
                  }else{                
                        res.render('results',{content: content, contentType: search.contentType});
              }
          });
    }
});

router.get('/results', middlewares.isLoggedIn, function(req, res) {
   res.render('results',{content: undefined, contentType: undefined}); 
});

//MESSAGES///////////////////////////

router.post('/groups/:id/messages/add', function(req, res) {
   var image = req.user.image, 
       name = req.user.username,
       content = req.body.content,
       groupID = req.params.id;
       
       dataAcess.addMessageToGroup(groupID, 
       {
           image: image,
           name: name,
           content: content
           
       }, function(){
           res.redirect('back');
       });
});

router.post('/events/:id/messages/add', function(req, res) {
   var image = req.user.image, 
       name = req.user.username,
       content = req.body.content,
       eventID = req.params.id;
       
       dataAcess.addMessageToEvent(eventID, 
       {
           image: image,
           name: name,
           content: content
           
       }, function(){
           res.redirect('back');
       });
});

/////////////////////////////

module.exports = router;