const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const winston = require('winston');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token") {
    winston.debug("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    winston.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

/**
 * Connect to Mongo and start app listening to port
 * @param  {string} PORT  - port of web server
\*/
module.exports = function startServer(PORT) {

  app.listen(PORT);

};
