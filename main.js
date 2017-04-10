// Load the Discordie node module
var Discordie = require('discordie');

const Event = Discordie.Events;
const Tyrone = new Discordie();

// See how fast the boat is loaded.
var loading = new Date().getTime();
var load_time;

Tyrone.connect({
	token: 'MzAwODczNTk0OTYyMDUxMDcz.C8yyOA.uzKHOizKOZxWjeARU0As5r-jldc'
})


Tyrone.Dispatcher.on(Event.GATEWAY_READY, e => {
	// Get how many milliseconds have passed since the loading variable was loaded.
	var currentMillisecondsPassed=new Date().getTime()-loading;
	// Convert milliseconds to seconds for readibility.
	load_time = currentMillisecondsPassed / 1000
	// Print to the console when the bot has been loaded.
	console.log('Bot Online! Connected in '+load_time+' seconds.')
	
})

// Event listener for when a new message is created.
Tyrone.Dispatcher.on(Event.MESSAGE_CREATE, e => {
	// Detect if the message contains Tyrone's name.
  if (e.message.content.toLowerCase().includes("tyrone") == true) {
  	e.message.channel.sendMessage('Yo stop saying my name.');
  }
})
