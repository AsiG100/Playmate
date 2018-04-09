var request = require("request");

request('', function(err, res, body){
    if(!err && res.statusCode == 200)
    {
        console.log(body);
    }else if(err){
        console.log(err);
    }else{
        console.log(res.statusCode);
    }
});