/*
  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node index.js
*/

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var os = require('os');

var rootUrl = 'https://medilogik.atlassian.net/browse/';

var controller = Botkit.slackbot({
    debug: true
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears('(EMS|AVA)', ['ambient', 'direct_message', 'direct_mention', 'mention'], function(bot, message) {    
    var ticketsRegex = /((?:EMS|AVA)-\d+)/gi;
    var matches;
    var tickets = [];

    bot.api.users.info({user: message.user}, function(err, response) {
        if (response.user.is_bot)
            return;

        while (matches = ticketsRegex.exec(message.text)) {
            tickets.push(matches[0]);   
        }

        
        if (tickets.length > 0) {
            var urls = [];
            
            tickets.forEach(function(element) {
                var fullUrl = rootUrl + element;

                if (message.text.toLowerCase().indexOf(fullUrl.toLowerCase()) != -1) {
                    return;
                }
                
                if (urls.indexOf(fullUrl) == -1) {
                        urls.push(fullUrl);
                }
                
            }, this);

            if (urls.length > 0) {
                bot.reply(message, urls.join(' | '));
            }
        }
    });
});
