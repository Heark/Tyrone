// See how fast Tyrone is loaded.
var loading = new Date().getTime();
var load_time;

// Load the Discordie node module
var Discordie = require('discordie');

// Load Rivescript module
// The auto response AI for Tyrone
var RiveScript = require("rivescript");
var TyroneAI = new RiveScript();

// Perform a GET request for a JSON api
var getJSON = require('get-json');

var Character = require('maljs');

// Perform a GET request easily
var fs = require('fs'),
    request = require('request');

// Best Pokemon API for the !pokemon command.
var Pokedex = require("pokedex-promise-v2")


// IMDB api for the !imdb command
const imdb = require('imdb-api');

// Constants for the actual bot.
const Event = Discordie.Events;
const Tyrone = new Discordie();

// Spotify API
var SpotifyWebApi = require('spotify-web-api-node');




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



// Load rivescript replies.
TyroneAI.loadDirectory("AI", loading_complete, load_error);

function loading_complete(batch_num) {

    TyroneAI.sortReplies();

    // Event listener for when a new message is created.
    Tyrone.Dispatcher.on(Event.MESSAGE_CREATE, e => {
        // Detect if the message contains Tyrone's name.
        if (e.message.content.toLowerCase().includes("tyrone") == true) {
            // Send message to the bot and search for a reply

            // if the message is just tyrone send it without removing tyrone.
            if (e.message.content.toLowerCase() == "tyrone") {
                var reply = TyroneAI.reply("local-user", e.message.content.toLowerCase());
                e.message.channel.sendMessage(reply);
            } else {
                var reply = TyroneAI.reply("local-user", e.message.content.toLowerCase().replace("tyrone", ""));
                e.message.channel.sendMessage(reply);
            }
        }
    })

}

function load_error(error) {
    console.log("Error when loading files: " + error);
}

Tyrone.connect({
    token: 'INSERT YOUR TOKEN HERE'
})
var commands = ["define", "character", "imdb", "pokemon", "spotify"];

Tyrone.Dispatcher.on(Event.GATEWAY_READY, e => {
    // Get how many milliseconds have passed since the loading variable was loaded.
    var currentMillisecondsPassed = new Date().getTime() - loading;
    // Convert milliseconds to seconds for readibility.
    load_time = currentMillisecondsPassed / 1000;
    // Print to the console when the bot has been loaded.
    console.log('Bot Online! Connected in ' + load_time + ' seconds.');

})

// Event listener for when a new message is created.
Tyrone.Dispatcher.on(Event.MESSAGE_CREATE, e => {
    // Detects if the first character of the message is the command symbol
    if (e.message.content.toLowerCase().charAt(0) == Command_Symbol) {
        // gets the user input after the command or gets all the text after the first space.
        var userdata = e.message.content.substring(e.message.content.indexOf(" ") + 1);
        // gets the user input ater the second space
        var delimiter = ' ',
            atIndex = 1,
            tokens = e.message.content.split(delimiter).slice(atIndex),
            result = tokens.join(delimiter),
            userdata_2 = result.substring(result.indexOf(" ") + 1);



        // gets the substring in between characters in this case the text between the command symbol and the first space
        var command = e.message.content.split(Command_Symbol).pop().split(' ').shift();
        // checks if the message is an actual command by checking if the command string is in the commands array.
        if (inArray(commands, command) == true) {
            // Commands start here, must be added to the commands array as well.

            if (command == "define") {
                if (userdata == "" || undefined || "!define") {
                    e.message.channel.sendMessage("Bruh you have to say what you want to define.");
                } else {
                    var word = userdata;
                    getJSON("http://api.urbandictionary.com/v0/define?term=" + word, function(error, c) {
                        var getword = c.list[0].word,
                            word = getword.charAt(0).toUpperCase() + getword.substring(1),
                            definition = c.list[0].definition,
                            out = "```" + word + ":``` " + definition;
                        e.message.channel.sendMessage(out);
                    });
                }
            } else if (command == "character") {
                if (userdata == "" || undefined || "!character") {
                    e.message.channel.sendMessage("Bruh you have to say who you want to look up.");
                } else {
                    var name = userdata.toLowerCase();
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
            } else if (command == "imdb") {
                if (userdata == "" || undefined || "!imdb") {
                    e.message.channel.sendMessage("Bruh you have to say what you want to look up.");
                } else {
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

            } else if (command == "pokemon") {
                if (userdata == "" || undefined || "!pokemon") {
                    e.message.channel.sendMessage("Bruh you have to say what you want to look up.");
                } else {


                    var Pokemon = new Pokedex();
                    var pokemon_name = userdata.toLowerCase();
                    Pokemon.getPokemonByName(pokemon_name)
                        .then(function(response) {
                            // once Again preventing upload before the image is downloaded.
                            download(response.sprites.front_default, '' + pokemon_name + '.png', function() {
                                console.log('Downloaded image of ' + pokemon_name);
                            });
                            var POKEMONDATA = response
                            setTimeout(function() {
                                e.message.channel.uploadFile('' + pokemon_name + '.png');
                                e.message.channel.sendMessage(upcase(pokemon_name));
                                console.log("Getting information on " + pokemon_name);
                                e.message.channel.sendMessage('Base Stats: ');
                                e.message.channel.sendMessage(upcase(POKEMONDATA.stats[0].stat.name) + ': ' + POKEMONDATA.stats[0].base_stat);
                                e.message.channel.sendMessage(upcase(POKEMONDATA.stats[1].stat.name) + ': ' + POKEMONDATA.stats[1].base_stat);
                                e.message.channel.sendMessage(upcase(POKEMONDATA.stats[2].stat.name) + ': ' + POKEMONDATA.stats[2].base_stat);
                                e.message.channel.sendMessage(upcase(POKEMONDATA.stats[3].stat.name) + ': ' + POKEMONDATA.stats[3].base_stat);
                                e.message.channel.sendMessage(upcase(POKEMONDATA.stats[4].stat.name) + ': ' + POKEMONDATA.stats[4].base_stat);
                                e.message.channel.sendMessage(upcase(POKEMONDATA.stats[5].stat.name) + ': ' + POKEMONDATA.stats[5].base_stat);
                            }, 5000);

                        })
                        .catch(function(error) {
                            e.message.channel.sendMessage('LMFAOOOOOOOOOO There ain\'t no pokemon called ' + pokemon_name + '.');
                        });
                }
            } else if (command == "spotify") {

                if (userdata == "!spotify") {
                    e.message.channel.sendMessage("Ok... so what you want me to do.");
                } else {
                    var Spotify = new SpotifyWebApi();

                    var sub_command = userdata.toLowerCase().replace(userdata_2, "").replace(" ", "");
                    if (sub_command == "playlistsearch") {
                        var playlist = userdata_2.toLowerCase();
                        Spotify.searchPlaylists(playlist)
                            .then(function(data) {
                                e.message.channel.sendMessage('Yo I Found this playlists:');
                                e.message.channel.sendMessage(data.body.playlists.items[Math.floor(Math.random() * 20) + 0].external_urls.spotify);
                            }, function(err) {
                                e.message.channel.sendMessage('Damn, I got nothing');
                            });
                    }
                }
            }

        } else {
            e.message.channel.sendMessage("LMAO the command " + command + " doesn't exist homie.")
        };

    }

})
