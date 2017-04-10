// Load the Discordie node module
var Discordie = require('discordie');
// Load Rivescript module
// The auto response AI for Tyrone
var RiveScript = require("rivescript");
var TyroneAI = new RiveScript();
var getJSON = require('get-json');
var Character = require('maljs');
var fs = require('fs'),
    request = require('request');
const imdb = require('imdb-api');

const Event = Discordie.Events;
const Tyrone = new Discordie();



// See how fast Tyrone is loaded.
var loading = new Date().getTime();
var load_time;

// Command symbol used to detect when a command is being used.
var Command_Symbol = "!"

// Useful functions to be used.
// capitalizes first letter in a string.
function upcase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function inArray(arg, value) {
    if (arg.indexOf(value) !== -1) {
        return true;
    } else {
        return false;
    }
}

// downloads files from link and stores them locally
var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        console.log('error:', err); // Print the error if one occurred 
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });

};
//////////////////////////////////////////////////////////////////////////////////


// Load rivescript replies aka all files in the AI folder.
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
    token: 'INSERT YOUR TOKEN HERE'
})
var commands = ["define", "character", "imdb"]

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
        // gets the user input after the command or gets all the text after the space.
        var userdata = e.message.content.substring(e.message.content.indexOf(" ") + 1);

        // gets the substring in between characters in this case the text between the command symbol and the first space
        var command = e.message.content.split(Command_Symbol).pop().split(' ').shift();
        // checks if the message is an actual command by checking if the command string is in the commands array.
        if (inArray(commands, command) == true) {
            // Commands start here, must be added to the commands array as well.

            if (command == "define") {
                var word = userdata;
                // used getJSON module to access the Urban dictionary api. 
                getJSON("http://api.urbandictionary.com/v0/define?term=" + word, function(error, c) {
                    var getword = c.list[0].word,
                        word = getword.charAt(0).toUpperCase() + getword.substring(1),
                        definition = c.list[0].definition,
                        out = "```" + word + ":``` " + definition;
                    e.message.channel.sendMessage(out);
                });
            } else if (command == "character") {
                var name = userdata.toLowerCase();

                function animeSearch() {


                    Character.quickSearch(name).then(function(results) {
                        // access and fetch the first character
                        results.character[0].fetch().then(function(r) {
                            // access and fetch the first anime
                            r.animeography[0].fetch().then(function(r) {
                                console.log(r.pictures[0]);
                                // download the first picture
                                download(r.pictures[0], '' + name + '.jpg', function() {
                                    console.log('Downloaded image of ' + name);
                                });
                            // Tyrone will try to upload the image before it is downloaded so we set it on a 5 second time out.
                                setTimeout(function() {
                                    e.message.channel.uploadFile('' + name + '.jpg', null, " " + upcase(name) + " is a character from the anime: " + r.title, true);
                                    e.message.channel.sendMessage(r.description);
                                }, 5000);


                            })
                        });
                    });
                }
                animeSearch();
            } else if (command == "imdb") {
                var moviename = userdata.toLowerCase();
                imdb.getReq({
                    name: moviename
                }, (err, things) => {
                    var movie = things;
                    download(things.poster, '' + moviename + '.jpg', function() {
                        console.log('Downloaded image of ' + moviename);
                    });
                    // Again preventing upload before the image is downloaded.
                    setTimeout(function() {
                        e.message.channel.uploadFile('' + moviename + '.jpg');
                        e.message.channel.sendMessage(things.plot);
                        e.message.channel.sendMessage('Rating: ' + things.rating);
                    }, 5000);
                });

            }




        } else {
            e.message.channel.sendMessage("LMAO the command " + command + " doesn't exist homie.")
        };

    }

})
