function isLoggedIn( req, res, next){
     if(req.isAuthenticated()){
         res.locals.user = req.user;
         addErrHandeling(req, res);
         return next();
    }
    else{
        console.log("redirecting to login...");
        res.render('login');    
    }
}

function addErrHandeling(req, res){
    var err = res.locals.errorMessage = req.flash('error');
    console.log(err);
    var success = res.locals.successMessage = req.flash('success');
    console.log(success);
}

module.exports = {
                    isLoggedIn: isLoggedIn
                        
                 }