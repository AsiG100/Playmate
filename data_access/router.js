let express = require("express"),
    router  = express.Router(),
    User    = require("./schemas.js").user,
    middlewares = require("./middlewares.js"),
    googleApi = require("../googleCalendar/googleAPI.js"),
    dataAcess = require("./dataAccess.js");

//INDEX//////////////////////////
router.get('/', middlewares.isLoggedIn, function(req, res) {
        dataAcess.getMyContent(req.user, res, function(){
            dataAcess.getUserFromDB(req.user, function(user) {
               dataAcess.getFriendsContent(user.favoriteUsers, res, function(){
                    res.render('index'); 
                });
            });
        });
        dataAcess.getFavoritesFromFB(req.user);
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
            group.admin = user._id;
            group.save();
        }
    });
    res.redirect("/");  
    });
    
});

router.put('/groups/:id', function(req, res){
    var id = req.params.id;
    var group = req.body.group;
    dataAcess.updateGroupInDB(id,group); 
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
    res.redirect('/');
});

//EVENTS////////////////////////////
router.get('/events/add',middlewares.isLoggedIn, function(req, res) {
    res.render('addEvent');
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
            event.admin = user._id;
            event.save();
        }});
        res.redirect('/');
    })
});

router.put('/events/:id', function(req, res){
    var id = req.params.id;
    var event = req.body.event;
    dataAcess.updateEventInDB(id,event); 
    res.redirect('/');
});

//-view an event
router.get('/events/:id', middlewares.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getEventFromDB(id, function(event){
         console.log(event.participants);
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
    res.redirect('/');
});

//PROFILE/////////////////////////

router.get('/profile/:id',middlewares.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getMyContent(id, res, function(user){
        res.render('profile',{profile:user});
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

//GOOGLE CALENDAR

router.post('/syncToCalendar', function(req, res) {
    var event = req.body.event,
         userID = req.body.user;
         
    googleApi.syncEventToCalendar(event, userID,function(url){
        console.log(url);    
        res.redirect(url)
    });
});

router.get('/googleCallback', function(req, res) {
    var code = req.params.code;
    console.log(code);
    
    googleApi.getAccessToken(code);
});

/////////////////////////////

module.exports = router;