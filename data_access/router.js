let express = require("express"),
    router  = express.Router(),
    User    = require("schemas.js").user,
    dataAcess = require("dataAcess.js");

router.get('/', dataAcess.isLoggedIn, function(req, res) {
        dataAcess.getMyContent(req.user, res, function(){
            dataAcess.getUserFromDB(req.user, function(user) {
               dataAcess.getFriendsContent(user.favoriteUsers, res, function(){
                    res.render('index'); 
                });
            });
        });
        dataAcess.getFavoritesFromFB(req.user);
});

router.get('/groups/add', dataAcess.isLoggedIn, function(req, res) {
    res.render('addGroup');
});

router.post('/groups',dataAcess.isLoggedIn, function(req, res){
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

//-view a group
router.get('/groups/:id', dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getUserFromDB({_id:id}, function(user){
         res.render('viewGroup',{user:user});
    });
});

router.get('/groups/:id/edit',dataAcess.isLoggedIn ,function(req, res) {
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

router.get('/events/add',dataAcess.isLoggedIn, function(req, res) {
    res.render('addEvent');
});

router.post('/events', dataAcess.isLoggedIn, function(req, res) {
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
router.get('/events/:id', dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getUserFromDB({_id:id}, function(user){
         res.render('viewEvent',{user:user});
    });
});

router.get('/events/:id/edit',dataAcess.isLoggedIn ,function(req, res) {
    var id = req.params.id;
    dataAcess.getEventFromDB(id, function(event){
            res.render('editEvent',{event:event});    
    });
});

router.delete('/events/:id', dataAcess.isLoggedIn, function(req, res){
    var id = req.params.id;
    dataAcess.deleteEventFromDB(id);
    res.redirect('/');
});

router.get('/profile/:id',dataAcess.isLoggedIn, function(req, res) {
    var id = req.params.id;
    dataAcess.getMyContent(id, res, function(user){
        res.render('profile',{profile:user});
    });
});

router.post('/friends/add', function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;
    
    dataAcess.addFavoriteFriendToDB(user, friend);
    res.redirect('back');
});

router.post('/friends/remove', function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;
    
    dataAcess.removeFavoriteFriendFromDB(user, friend);
    res.redirect('back');
});
