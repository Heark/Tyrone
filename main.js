// Load the Discordie node module
var Discordie = require('discordie');
// Load Rivescript module
// The auto response AI for Tyrone
var RiveScript = require("rivescript");
var TyroneAI = new RiveScript();
var getJSON = require('get-json')

const Event = Discordie.Events;
const Tyrone = new Discordie();

// See how fast the boat is loaded.
var loading = new Date().getTime();
var load_time;

// Command symbol used to detect when a command is being used.
var Command_Symbol = "!"

// Load rivescript replies.
TyroneAI.loadDirectory("AI", loading_complete, load_error);

function loading_complete(batch_num) {

    TyroneAI.sortReplies();

    // Event listener for when a new message is created.
    Tyrone.Dispatcher.on(Event.MESSAGE_CREATE, e => {
        // Detect if the message contains Tyrone's name.
        if (e.message.content.toLowerCase().includes("tyrone") == true) {
            // Send message to the bot and search for a reply
            var reply = TyroneAI.reply("local-user", e.message.content);
            e.message.channel.sendMessage(reply);
        }
    })

}

function load_error(error) {
    console.log("Error when loading files: " + error);
}

Tyrone.connect({
    token: 'MzAwODczNTk0OTYyMDUxMDcz.C8yyOA.uzKHOizKOZxWjeARU0As5r-jldc'
})
var commands = ["define"]

Tyrone.Dispatcher.on(Event.GATEWAY_READY, e => {
    // Get how many milliseconds have passed since the loading variable was loaded.
    var currentMillisecondsPassed = new Date().getTime() - loading;
    // Convert milliseconds to seconds for readibility.
    load_time = currentMillisecondsPassed / 1000
    // Print to the console when the bot has been loaded.
    console.log('Bot Online! Connected in ' + load_time + ' seconds.')

})

// Event listener for when a new message is created.
Tyrone.Dispatcher.on(Event.MESSAGE_CREATE, e => {
    // Detects if the first character of the message is the command symbol
    if (e.message.content.toLowerCase().charAt(0) == Command_Symbol) {
        // gets the user input after the command
        var userdata = e.message.content.substring(e.message.content.indexOf(" ") + 1);
        // checks if the message is an actual command probably a really slow method but hey
        for (var i = 0; i < commands.length; i++) {
            if (e.message.content.substring(1, commands[i].length + 1) == commands[i]) {
                var command = e.message.content.substring(1, commands[i].length + 1);

                // Commands start here, must be added to the commands array as well.

                if (command == "define") {
                    var word = userdata;
                    getJSON("http://api.urbandictionary.com/v0/define?term=" + word, function(error, c) {
                        var getword = c.list[0].word,
                            word = getword.charAt(0).toUpperCase() + getword.substring(1),
                            definition = c.list[0].definition,
                            out = "```" + word + ":``` " + definition;
                        e.message.channel.sendMessage(out);
                    });
                }




            } else {
                e.message.channel.sendMessage("LMAO that command doesn't exist. Homie.")
            };
        }
    }

})
