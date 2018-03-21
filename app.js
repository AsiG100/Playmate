var express    = require("express"),
    app        = express(),
    request    = require("request"),
    bodyParser = require('body-parser');
    
//SETTINGS---------------------------------------------
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
///////////////////////////////////////////////////////
    
app.get('/', function(req, res){
    res.send('The page works'); 
});



app.listen(process.env.PORT, process.env.IP, function(){
    console.log('The server is running on port '+process.env.PORT+' and ip '+process.env.IP);
});