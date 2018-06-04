var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

//SCHEMAS AND MODELS/////////////////////////////////////

const levels = [
                        {
                        name: 'Noob',
                        maxExp: 100,
                        index: 0,
                        image: 'http://icons.iconarchive.com/icons/glyphish/glyphish/32/108-badge-icon.png'
                        },
                        {
                        name: 'Rookie',
                        maxExp: 500,
                        index: 1,
                        image: 'http://icons.iconarchive.com/icons/emey87/trainee/48/Badge-Prize-icon.png'
                        },
                        {
                        name: 'Junior',
                        maxExp: 1000,
                        index: 2,
                        image: 'http://icons.iconarchive.com/icons/icojam/onebit-4/48/badge-silver-icon.png'
                        },
                        {
                        name: 'GrownUp',
                        maxExp: 2000,
                        index: 3,
                        image: 'http://icons.iconarchive.com/icons/icojam/onebit-4/48/badge-gold-icon.png'
                        },
                        {
                        name: 'Knight',
                        maxExp: 5000,
                        index: 4,
                        image: 'http://icons.iconarchive.com/icons/google/noto-emoji-activities/64/52726-sports-medal-icon.png'
                        },
                        {
                        name: 'King',
                        maxExp: Infinity,
                        index: 5,
                        image: 'http://icons.iconarchive.com/icons/google/noto-emoji-people-clothing-objects/64/12200-crown-icon.png'
                        }
                ];


const sportTypes =  [
                        'TRX',
                        'Football',
                        'Basketball',
                        'Running',
                        'Swimming',
                        'Tennis',
                        'Bowling'
                    ] ;

var groupSchema = new mongoose.Schema({
        dateOfCreation: Date,
        name: String,
        sportType: String,
        days: [String],
        time: String,
        location: String,
        district:String,
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
         district:String,
         maxNumOfParticipants: Number,
         minNumOfParticipants: Number,
         dateOfCreation: Date,
         dateOfEvent: String,
         timeOfActivity: {
             startTime: String,
             endTime: String
         },
         sportType: String,
         level: Object, // From beginner to expert
         exp: Number,//The individual score
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
        level: Object,
        email: String,
        district:String,
        sportTypes: [String], //Sport types the user interested in
        events: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}], //Events the user participates in
        groups: [{type: mongoose.Schema.Types.ObjectId, ref: "Group"}], //Groups the user participates in
        exp: Number, //The score of each user
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
                  sportTypes: sportTypes,
                  levels: levels
                  };
