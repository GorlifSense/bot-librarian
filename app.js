const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const winston = require('winston');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Server index page
app.get('/', function (req, res) {
  res.send(`@botlibrarian here. Current version is v${require('./package.json').version}`);
});

// Facebook Webhook
// Used for verification
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
    winston.debug('Verified webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    winston.error('Verification failed. The tokens do not match.');
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post('/webhook', function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == 'page') {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        }
      });
    });

    res.sendStatus(200);
  }
});

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === 'Greeting') {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: 'https://graph.facebook.com/v2.6/' + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: 'first_name'
      },
      method: 'GET'
    }, function(error, response, body) {
      var greeting = '';
      if (error) {
        winston.error('Error getting user\'s name: ' +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = 'Hi ' + name + '. ';
      }
      var message = greeting + 'My name is SP Movie Bot. I can tell you various details regarding movies. What movie would you like to know about?';
      sendMessage(senderId, {text: message});
    });
  }
}

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      winston.error('Error sending message: ' + response.error);
    }
  });
}

/**
 * Connect to Mongo and start app listening to port
 * @param  {string} PORT  - port of web server
\*/
module.exports = function startServer(PORT) {

  app.listen(PORT);

};
