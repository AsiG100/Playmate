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
                                +'"redirect_uris":["https://playmate-zmirnoff.c9users.io/googleCallback"],'
                                +'"javascript_origins":["https://playmate-zmirnoff.c9users.io"]'
                             +'}'
                        +'}';
let TOKEN_PATH;
let oAuth2Client;
let user;
let event;

function syncEventToCalendar(event, userID, cb){
    event = event;
    dataAccess.getUserFromDB({_id: userID}, function(userContent){
        user = userContent;
        if(user.calendar != null){
            TOKEN_PATH = user.calendar.credentials;
        }
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
  let token = {};
   oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  if(TOKEN_PATH != undefined){
    console.log('there is a token');
    token = TOKEN_PATH;
  }else{
      console.log('no token');
    var url = getAuthURL(oAuth2Client);
    return url;
  }
  
  oAuth2Client.setCredentials(JSON.parse(token));
  callback(oAuth2Client);
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

  return authUrl;
} 
 
function getAccessToken(code, callback) {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      try {
        TOKEN_PATH = JSON.stringify(token);
        console.log('Token stored to', TOKEN_PATH);
      } catch (err) {
        console.error(err);
      }
      callback(oAuth2Client);
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, {data}) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

function insertEvent(auth){
    // Refer to the Node.js quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/node
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.
console.log(auth);
 const calendar = google.calendar({version: 'v3', auth});
var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2018-05-17T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2018-05-18T17:00:00-08:00',
    'timeZone': 'America/Los_Angeles',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

calendar.events.insert({
  auth: auth,
  calendarId: 'primary',
  resource: event,
}, function(err, event) {
  if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }
  console.log('Event created: %s', event.htmlLink);
});
}

module.exports = {
    syncEventToCalendar: syncEventToCalendar,
    getAccessToken: getAccessToken
};