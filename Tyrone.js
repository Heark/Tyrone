// See how fast Tyrone is loaded.
var loading = new Date().getTime();
var load_time;

// Load the Discordie node module
const Discordie = require('discordie');

// Load Rivescript module
// The auto response AI for Tyrone
const RiveScript = require("rivescript");
const TyroneAI = new RiveScript();

// Perform a GET request for a JSON api
const getJSON = require('get-json');

const Character = require('maljs');

// Perform a GET request easily
const fs = require('fs'),
    request = require('request');

// Best Pokemon API for the !pokemon command.
const Pokedex = require("pokedex-promise-v2");


// IMDB api for the !imdb command
const imdb = require('imdb-api');



// Constants for the actual bot.
const Event = Discordie.Events;
const Tyrone = new Discordie();

// Spotify API
const SpotifyWebApi = require('spotify-web-api-node');

// Variables for the Zombiez game.
var zombie_shot = false;
var Zombiez_on = false;


// Command symbol used to detect when a command is being used.
var Command_Symbol = "!";

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

// Formats a number to a string using regex and adds commas marking the thousandths place and such
function format(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

// Checks if a file exists and returns true or false
function FileExists(FileName) {
    fs.stat(FileName, function(err, stat) {
        if (err == null) {
            return true;
        } else if (err.code == 'ENOENT') {
            return false;
        } else {
            throw Error("Error: " + err.code);
        }
    });
}


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
    });

}

function load_error(error) {
    console.log("Error when loading files: " + error);
}

Tyrone.connect({
    token: 'INSERT YOUR TOKEN HERE'
});
var commands = ["define", "character", "imdb", "pokemon", "spotify", "lol", "zombiezscore", "shoot"];

Tyrone.Dispatcher.on(Event.GATEWAY_READY, e => {
    // Get how many milliseconds have passed since the loading variable was loaded.
    var currentMillisecondsPassed = new Date().getTime() - loading;
    // Convert milliseconds to seconds for readibility.
    load_time = currentMillisecondsPassed / 1000;
    // Print to the console when the bot has been loaded.
    console.log('Bot Online! Connected in ' + load_time + ' seconds.');


});



// Event listener for when a new message is created.
Tyrone.Dispatcher.on(Event.MESSAGE_CREATE, e => {
    // ZOMBIEZ GAME \\
    function playZombiez() {
        if (Zombiez_on == true) {

        } else {
            Zombiez_on = true;
            var points = Math.floor(Math.random() * 1000) + 100;
            POINTS = points;
            e.message.channel.sendMessage("A ZOMBIE SHOWED UP SHOOT HIM FOR " + points + " ZOMBIE POINTS");
            e.message.channel.sendMessage("Use !shoot to shoot the zombie");
            setTimeout(function() {
                if (zombie_shot == false) {
                    e.message.channel.sendMessage("No one shot the Zombie, we gonna die.");
                } else {

                }
            }, 15000)
        }
    }

    setInterval(function() {
        playZombiez()
    }, 900000)


    // get zombiez scores
    function getZombiezScores(username) {
        fs.readFile("zombiez-scores/" + username + ".txt", "utf8", function(error, data) {
            return parseInt(data);
        });
    }

    function newPlayerUpdate(username, score) {
        fs.writeFile("zombiez-scores/" + username + ".txt", score, function(err) {
            if (err) {
                return console.log("Error writing file: " + err);
            }
        })
    }

    function newScore(username, score) {
        var new_score = getZombiezScores(username) + score;
        // erase the current score and write the new score
        fs.truncate("zombiez-scores/" + username + ".txt", 0, function() {
            fs.writeFile("zombiez-scores/" + username + ".txt", new_score, function(err) {
                if (err) {
                    return console.log("Error writing file: " + err);
                }
            });
        });


    }


    // END OF ZOMBIEZ GAME \\

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
        // boolean for commands with cooldowns
        var cooldown = false;
        // checks if the message is an actual command by checking if the command string is in the commands array.
        if (inArray(commands, command) == true) {
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

            } else if (command == "character") {
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
                            }, 2000);


                        });
                    });
                });

            } else if (command == "imdb") {
                var moviename = userdata.toLowerCase();
                imdb.getReq({
                    name: moviename
                }, (err, things) => {
                    download(things.poster, '' + moviename + '.jpg', function() {
                        console.log('Downloaded image of ' + moviename);
                    });
                    // Again preventing upload before the image is downloaded.
                    setTimeout(function() {
                        e.message.channel.uploadFile('' + moviename + '.jpg');
                        e.message.channel.sendMessage(things.plot);
                        e.message.channel.sendMessage('Rating: ' + things.rating);
                    }, 2000);
                });


            } else if (command == "pokemon") {
                var Pokemon = new Pokedex();
                var pokemon_name = userdata.toLowerCase();
                Pokemon.getPokemonByName(pokemon_name)
                    .then(function(response) {
                        // once Again preventing upload before the image is downloaded.
                        download(response.sprites.front_default, '' + pokemon_name + '.png', function() {
                            console.log('Downloaded image of ' + pokemon_name);
                        });
                        var POKEMONDATA = response;
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
                        }, 2000);

                    })
                    .catch(function(error) {
                        e.message.channel.sendMessage('LMFAOOOOOOOOOO There ain\'t no pokemon called ' + pokemon_name + '.');
                    });
            } else if (command == "spotify") {

                if (userdata == "!spotify") {
                    e.message.channel.sendMessage("Ok... so what you want me to do.");
                } else {
                    var Spotify = new SpotifyWebApi();
                    var sub_command = userdata.toLowerCase().replace(userdata_2.toLowerCase(), "").trimRight();
                    console.log(sub_command);
                    if (sub_command == "playlistsearch") {
                        var playlist = userdata_2.toLowerCase();
                        Spotify.searchPlaylists(playlist, {
                                limit: 50
                            })
                            .then(function(data) {
                                e.message.channel.sendMessage('Yo I Found this playlist:');
                                e.message.channel.sendMessage(data.body.playlists.items[Math.floor(Math.random() * 50) + 0].external_urls.spotify);
                            }, function(err) {

                                e.message.channel.sendMessage('Damn, I got nothing');
                            });

                    } else if (sub_command == "song") {
                        var song = userdata_2.toLowerCase();
                        Spotify.searchTracks(song)
                            .then(function(data) {
                                e.message.channel.sendMessage('YO is that this song');
                                e.message.channel.sendMessage(data.body.tracks.items[0].external_urls.spotify);
                            }, function(err) {
                                console.error(err);
                            });

                    } else if (sub_command == "user") {
                        var user = userdata_2.toLowerCase();
                        Spotify.getUser(user)
                            .then(function(data) {
                                // if there is no display name do nothing.
                                if (data.body.display_name == null || undefined) {

                                } else {
                                    e.message.channel.sendMessage(data.body.display_name);
                                }
                                e.message.channel.sendMessage('Followers: ' + format(data.body.followers.total));
                                e.message.channel.sendMessage(data.body.external_urls.spotify);
                            }, function(err) {
                                e.message.channel.sendMessage('lol  who?');
                            });

                    }
                }
            } else if (command == "lol") {
                var cancel_100 = false;
                var username = userdata.toLowerCase();
                getJSON("https://na.api.riotgames.com/api/lol/NA/v1.4/summoner/by-name/" + username + "?api_key=RGAPI-b45dbac3-7ee5-4d75-92a3-9b3c7431fc68", function(error, c) {
                    // Converting the JSON to a string so we can change the username to the string "USERNAME" so we can access the object.
                    var regJSON = JSON.stringify(c)
                    var LOL_JSON = JSON.parse(regJSON.replace(username, 'USERNAME'));
                    console.log(userdata)

                    function person_exist() {
                        if (LOL_JSON.USERNAME == undefined || null) {
                            cancel_100 = true
                        } else {

                        }
                    }
                    person_exist();
                    if (cancel_100 == true) {
                        e.message.channel.sendMessage("Nah that person isn't in the League of Legends database.")
                    } else {
                        var userID = LOL_JSON.USERNAME.id;
                        download("http://avatar.leagueoflegends.com/na/" + username + ".png", username + '-lol.png', function() {
                            console.log('Downloaded image of ' + username + ' from League of Legends');
                        });
                        //
                        setTimeout(function() {
                            e.message.channel.uploadFile(username + '-lol.png');
                            e.message.channel.sendMessage(LOL_JSON.USERNAME.name);
                            e.message.channel.sendMessage('Summoner Level: ' + LOL_JSON.USERNAME.summonerLevel);
                            getJSON("https://na.api.riotgames.com/api/lol/NA/v1.3/game/by-summoner/" + userID + "/recent?api_key=RGAPI-b45dbac3-7ee5-4d75-92a3-9b3c7431fc68", function(error, g) {
                                function win_or_lose() {
                                    var WIN_OR_LOSE_BOOL = g.games[0].stats.win;
                                    if (WIN_OR_LOSE_BOOL == true) {
                                        return "Win";
                                    } else {
                                        return "Loss";
                                    }
                                }

                                function getKDA() {
                                    var kills = g.games[0].stats.championsKilled;
                                    var deaths = g.games[0].stats.numDeaths;
                                    var assists = g.games[0].stats.assists;

                                    if (kills == null || undefined) {
                                        kills = 0;
                                    }
                                    if (deaths == null || undefined) {
                                        deaths = 0;
                                    }
                                    if (assists == null || undefined) {
                                        assists = 0;
                                    }
                                    return kills + '/' + deaths + '/' + assists;
                                }
                                e.message.channel.sendMessage("Recent Game:");
                                e.message.channel.sendMessage("Game Mode: " + upcase(g.games[0].gameMode.toLowerCase()).replace('_', " ") + " Result: " + win_or_lose() + " KDA: " + getKDA());
                            });
                        }, 2000);
                    }
                });


            } else if (command == "zombiezscore") {
                if (FileExists("zombiez-scores/" + e.message.author.username + ".txt") == true) {
                    e.message.channel.sendMessage("Yoooo your Zombiez scoe is: " + getZombiezScores(e.message.author.username))

                } else {
                    e.message.channel.sendMessage("Bro you haven't shot any zombies.")
                }

            } else if (command == "shoot") {

                if (Zombiez_on == true) {
                    Zombiez_on = false;
                    zombie_shot = true;
                    if (FileExists("zombiez-scores/" + e.message.author.username + ".txt") == true) {
                        newScore(e.message.author.username, POINTS);
                    } else {
                        newPlayerUpdate(e.message.author.username, POINTS);
                    }
                    e.message.channel.sendMessage(e.message.author.username + " shot the zombie and got " + POINTS + " points!")
                } else {
                    e.message.channel.sendMessage("There is no zombie fool.");
                }
            }
        } else {
            e.message.channel.sendMessage("LMAO the command " + command + " doesn't exist homie.");
        }

    }

})
