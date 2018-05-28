var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

//SCHEMAS AND MODELS/////////////////////////////////////
const sportTypes =  [
                        'TRX',
                        'Football',
                        'Basketball',
                        'Running',
                        'Swimming',
                        'Tennis',
                        'Bowling'
                    ] 

var groupSchema = new mongoose.Schema({
        dateOfCreation: Date,
        name: String,
        sportType: String,
        days: [String],
        time: String,
        location: String,
        minParticipants: Number,
        maxParticipants: Number,
        level: String,
        group: {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
        events: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}],
        participants: [{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
        messages: [{type: mongoose.Schema.Types.ObjectId, ref:"Message"}]
        
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
         group: {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
         participants: [{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
         messages: [{type: mongoose.Schema.Types.ObjectId, ref:"Message"}]
});
var eventModel = mongoose.model("Event", eventSchema);

var userSchema = new mongoose.Schema({
        facebook: {
            id: String,
            token: String,
        },
        calendar: {
            credentials: Object
        },
        birthDate: String,
        email: String,
        district:String,
        sportTypes: [String], //Sport types the user interested in
        events: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}], //Events the user participates in
        groups: [{type: mongoose.Schema.Types.ObjectId, ref: "Group"}], //Groups the user participates in
        gameProgress: Number, //The score of each user
        favoriteUsers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        image: String
});
    userSchema.plugin(passportLocalMongoose);
var userModel = mongoose.model('User', userSchema);

var searchTrackSchema = mongoose.Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        sportType: String,
        district: String,
        level: String
});
var searchTrackModel = mongoose.model('Track', searchTrackSchema);

var messageSchema = mongoose.Schema({
   image: String,
   name: String,
   content: String
});
var messageModel = mongoose.model('Message', messageSchema);

///EXPORTS/////////////////////////////////////////////////
module.exports = {'user' : userModel, 
                  'event': eventModel,
                  'group': groupModel,
                  'track': searchTrackModel,
                  'Message': messageModel,
                  sportTypes: sportTypes
                  };
