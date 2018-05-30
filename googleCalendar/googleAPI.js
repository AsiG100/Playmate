const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const fs = require('fs');
const dataAccess = require("../data_access/dataAccess.js");
const readline = require('readline');
const {google} = require('googleapis');
const client_secret = '{"web":{'
                                +'"client_id":"174664006521-s7ut68oua0v8jvt6db7vgeh611fiv33b.apps.googleusercontent.com",'
                                +'"project_id":"aerial-chimera-204307",'
                                +'"auth_uri":"https://accounts.google.com/o/oauth2/auth",'
                                +'"token_uri":"https://accounts.google.com/o/oauth2/token",'
                                +'"auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",'
                                +'"client_secret":"gARqs0nO3UUY7cFgZhnfzxcy",'
                                +'"redirect_uris":["https://playmate1.herokuapp.com/googleCallback"],'
                                +'"javascript_origins":["https://playmate1.herokuapp.com"]'
                             +'}'
                        +'}';
const EventModel = require("../data_access/schemas.js").event;

let TOKEN_PATH;
let oAuth2Client;
let user;
let syncedEvent;

function syncEventToCalendar(event, userID, cb){
    syncedEvent = event;
    dataAccess.getUserFromDB({_id: userID}, function(userContent){
        user = userContent;
        // if(user.calendar != null){
        //     TOKEN_PATH = user.calendar.credentials;
        // }
        
            // Load client secrets from a local file.
        try {
            console.log('need authorization');
            var url = authorize(JSON.parse(client_secret), insertEvent);
            cb(url);
        } catch (err) {
          return console.log('Error loading client secret file:', err);
        }
    });


}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @return {function} if error in reading credentials.json asks for a new one.
 */
function authorize(credentials, callback) {
  const client_secret = credentials.web.client_secret,
        client_id = credentials.web.client_id,
        redirect_uris = credentials.web.redirect_uris;
   
   oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  if(TOKEN_PATH == undefined){
      console.log('no token');
    var url = getAuthURL(oAuth2Client);
    return url;
  }

  console.log('there is a token');
  oAuth2Client.setCredentials(JSON.parse(TOKEN_PATH));
  callback(oAuth2Client, function(){
    console.log('event synced');
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAuthURL(oAuth2Client){
  console.log('getting url');
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log(authUrl);
  return authUrl;
} 
 
function getAccessToken(code, callback) {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      try {
        TOKEN_PATH = JSON.stringify(token);
        // user.calendar.credentials = TOKEN_PATH;
        // user.save(function(){
        //   console.log('saved creds to user');
        // });
      
        
      } catch (err) {
        console.error(err);
      }
      
      callback(oAuth2Client);
    });
}

function insertEvent(auth, cb){
TOKEN_PATH = undefined;
const calendar = google.calendar({version: 'v3', auth});
EventModel.findById(syncedEvent, function(err, syncedEvent){
    if(err){
      console.log(err);
    }else{
      console.log(syncedEvent.name+' '+syncedEvent.location+' '+syncedEvent.dateOfEvent);
      var Event = {
        'summary': syncedEvent.name,
        'location': syncedEvent.location,
        'start': {
          'dateTime': syncedEvent.dateOfEvent+'T'+syncedEvent.timeOfActivity.startTime+':00',
          'timeZone': 'Asia/Jerusalem'
        },
        'end': {
          'dateTime': syncedEvent.dateOfEvent+'T'+syncedEvent.timeOfActivity.endTime+':00',
          'timeZone': 'Asia/Jerusalem'
        }
      };
      
      
      calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: Event,
      }, function(err, Event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', Event.htmlLink);
        cb();
      });
    }
});

}

module.exports = {
    syncEventToCalendar: syncEventToCalendar,
    getAccessToken: getAccessToken,
    insertEvent: insertEvent
};