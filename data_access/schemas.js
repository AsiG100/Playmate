var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

//SCHEMAS AND MODELS/////////////////////////////////////

var groupSchema = new mongoose.Schema({
        dateOfCreation: Date,
        name: String,
        type: String,
        daysAndTime: [{
            day: String,
            Time: String
        }],
        location: String,
        minParticipants: Number,
        maxParticipants: Number,
        level: String,
        events: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}],
        participants: [{type:mongoose.Schema.Types.ObjectId, ref:"User"}]
});
var groupModel  = mongoose.model("Group", groupSchema);

var eventSchema = new mongoose.Schema({
         name: String,
         location: String, //The location URI
         maxNumOfParticipants: Number,
         minNumOfParticipants: Number,
         dateOfCreation: Date,
         dateOfEvent: String,
         timeOfActivity: {
             startTime: String,
             endTime: String
         },
         sportType: String,
         level: String, // From beginner to expert
         gameLevel: Number,//The individual score
         agesRange: String, // Ages of the participates
         participants: [{type:mongoose.Schema.Types.ObjectId, ref:"User"}]
});
var eventModel = mongoose.model("Event", eventSchema);

var sportTypeSchema = new mongoose.Schema({
        name: String     
});
var sportTypeModel = mongoose.model('Type', sportTypeSchema);

var userSchema = new mongoose.Schema({
        facebook: {
            id: String,
            token: String,
        },
        calendar: {
            credentials: Object
        },
        name: String,
        birthDate: String,
        email: String,
        address:{
                    country: String,
                    city: String,
                    street: String,
                    streetNum: Number
                },
        sportTypes: [{type: mongoose.Schema.Types.ObjectId, ref: "Type"}], //Sport types the user interested in
        events: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}], //Events the user participates in
        groups: [{type: mongoose.Schema.Types.ObjectId, ref: "Group"}], //Groups the user participates in
        gameProgress: Number, //The score of each user
        favoriteUsers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        preferences: [String], //Hours, age ranges, locations ,etc...
        image: String
});
    userSchema.plugin(passportLocalMongoose);
var userModel = mongoose.model('User', userSchema);

///EXPORTS/////////////////////////////////////////////////
module.exports = {'user' : userModel, 'sportType': sportTypeModel, 'event': eventModel, 'group': groupModel};
