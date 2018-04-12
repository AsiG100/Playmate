var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

//SCHEMAS AND MODELS/////////////////////////////////////
var eventSchema = new mongoose.Schema({
         name: String,
         location: String, //The location URI
         numOfParticipates: Number,
         // creator: user
         dateOfCreation: Date,
         dateOfEvent: Date,
         // sportType: sportType
         // level: level // From beginner to expert
         gameLevel: Number,//The individual score
         agesRange: String // Ages of the participates
});
var eventModel = mongoose.model("Event", eventSchema);

var sportTypeSchema = new mongoose.Schema({
        name: String     
});
var sportTypeModel = mongoose.model('Type', sportTypeSchema);

var userSchema = new mongoose.Schema({
        name: String,
        password: String,
        birthDate: Date,
        address:{
                    country: String,
                    city: String,
                    street: String,
                    streetNum: Number
                },
        sportTypes: [{type: mongoose.Schema.Types.ObjectId, ref: "Type"}], //Sport types the user interested in
        events: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}], //Events the user participates in
        // groups[]
        gameProgress: Number, //The score of each user
        // favoriteUsers[]
        // preferences[] //Hours, age ranges, locations ,etc...
        image: String //URL of a profile pic
});
    userSchema.plugin(passportLocalMongoose);
var userModel = mongoose.model('User', userSchema);

///EXPORTS/////////////////////////////////////////////////
module.exports = {'user' : userModel, 'sportType': sportTypeModel, 'event': eventModel};
