'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
// This is what our skill is known as within the context of alexa-app-server.
var app = new Alexa.app('airportinfo');
var FAADataHelper = require('./faa_data_helper');

// This app.launch is trigerred each time the skill is invoked and is required to send a response to the user.
// Here, we call the response say(prompt), so we expect it to prompt the data from var prompt.
app.launch(function(req, res) {
    var prompt = 'For delay information, please provide airport code';
    // reprompt is used anytime a user is expected to say something. The trigger time is approc 8seconds and can be adjusted
    // As per the need case
    // The shouldEndSession method determines whether Alexa will keep listening for user input, or will it dismiss.
    res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

// Creating the intent schema (named airportinfo)
// The key concept here is mapping Utterences to Intents
// The utterances can be invoked using the alexa-app and alexa-utterances modules.
app.intent('airportinfo', {
        'slots': {
            'AIRPORTCODE': 'FAACODES'
        },
        'utterances': ['{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}']
    },
    function(req, res) {
        //get the slot
        var airportCode = req.slot('AIRPORTCODE');
        var reprompt = 'Tell me an airport code to get delay information.';
        if (_.isEmpty(airportCode)) {
            var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
            res.say(prompt).reprompt(reprompt).shouldEndSession(false);
            return true;
        } else {
            var faaHelper = new FAADataHelper();

            faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
                console.log(airportStatus);
                res.say(faaHelper.formatAirportStatus(airportStatus)).send();
            }).catch(function(err) {
                console.log(err.statusCode);
                var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
                res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
            });
            return false;
        }
    }
);

//hack to support custom utterances in utterance expansion string
var utterancesMethod = app.utterances;
app.utterances = function() {
    return utterancesMethod().replace(/\{\-\|/g, '{');
};

module.exports = app