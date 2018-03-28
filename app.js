var express    = require("express"),
    app        = express(),
    request    = require("request"),
    bodyParser = require('body-parser');
    
//SETTINGS---------------------------------------------
app.set('view engine', 'ejs');
app.set('views', "/home/ubuntu/workspace/app/views");
app.use(bodyParser.urlencoded({extended:true}));
///////////////////////////////////////////////////////
    
app.get('/', function(req, res){
    res.render("index");
});




//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('The server is running on port '+process.env.PORT+' and ip '+process.env.IP);
});