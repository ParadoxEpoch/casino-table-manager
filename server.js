// Import and start express server and coordinator socket
// ? NOTE: We're using CJS imports for compatibility with pkg
const express = require('express');
const { open } = require('out-url');
const serverline = require("serverline");
const coordinator = require('./coordinator.js');

const app = express();
const webPort = 3030;
const socketPort = 3040; // Don't change this. It's currently hardcoded in the client.

process.stdout.write('\x1bc');

const prompt = 'Press "o" to open the manager, "h" for help or "e" to exit';
serverline.init({ colorMode : true });
serverline.setMuted(true, `\x1b[90m\x1b[1m${prompt} \x1b[0m`);

// Listen for keypress events
process.stdin.on('keypress', async (chunk, key) => {
	
	if (!key) return;

	// Exit on Ctrl+C or "e"
	if ((key.ctrl && key.name === 'c') || key.name === 'e') {
		process.stdout.write('\x1bc');
		console.log(`\x1b[1mExiting Casino Manager...\x1b[0m\n\nThank you, come again!\n`);
		process.exit();
	} else if (key.name === 'h') {
		printHelp()
	} else if (key.name === 'o') {
		process.stdout.write('\x1bc');
		console.log(`\x1b[1mOpening manager interface in your default browser...\x1b[0m\n`);
		open(`http://${results[0].address}:${webPort}`);
	}
});

// Get IP address of server for client connection
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const results = [];
for (const name of Object.keys(nets)) {
	for (const net of nets[name]) {
		// Skip over non-IPv4 and internal
		if (net.family !== 'IPv4' || net.internal) continue;
		results.push({ name, address: net.address });
	}
}

// Server static client files
app.use('/client', express.static(__dirname + '/client'));
app.use('/manager', express.static(__dirname + '/manager'));

// Root route
app.get('/', (req, res) => {
	res.send(`
	<!DOCTYPE html>
	<html>
		<head>
			<title>Casino Table Manager</title>
		</head>
		<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';">
			<div style="display:flex;justify-content:center;align-items:center;flex-direction:column">
				<img src="/manager/logo.png" alt="Casino Table Manager" style="width: 200px;margin-bottom:20px"/>
				<img src="/manager/logo_text.png" style="width: 250px;">
				<h1>Casino Table Manager</h1>
				<p style="text-align:center">Coordinator server is running on port <strong>${socketPort}</strong><br />Web server is running on port <strong>${webPort}</strong></p>
				<br />
				<div>
                    <button onclick="location.href = '/manager'">Go to Dealer View</button>
                    <button onclick="location.href = '/client'">Go to Player View</button>
                </div>
			</div>
		</body>
	</html>
	`);
});

function printHelp() {
	process.stdout.write('\x1bc');

	console.log(`\x1b[1mWelcome to Casino Table Manager!\x1b[0m\n`);
	console.log(`\x1b[92m\x1b[1mAccessing the table manager:\x1b[0m`);
	console.log(`\x1b[1mOn this device:\x1b[0m Press "o" on your keyboard or visit \x1b[94m\x1b[1mhttp://localhost:3030\x1b[0m in your browser`);
	console.log(`\x1b[1mOn another device:\x1b[0m Open a browser and go to \x1b[94m\x1b[1mhttp://${results[0].address}:${webPort}\x1b[0m on the other device`);
	console.log(`\n\x1b[1m\x1b[93mNOTE:\x1b[0m All devices need to be connected to the same network to access the table manager.`);

	if (results.length > 1) {
		console.log(`\n\x1b[1m\x1b[93mNOTE:\x1b[0m You have multiple network interfaces. If you're having trouble accessing the table manager on other devices, try using one of the following addresses instead:`);
		const otherAddresses = results.slice(1);
		console.log(`\x1b[94m\x1b[1mhttp://${otherAddresses.map(a => a.address + ':' + webPort).join('\x1b[0m, \x1b[94m\x1b[1mhttp://')}\x1b[0m`);
	}

	console.log(' ');

}

// Initialize server
(async () => {

	console.log(`Starting Casino Table Manager...\n`);

	await coordinator.init(socketPort);
	await new Promise(resolve => app.listen(webPort, resolve));

	process.stdout.write('\x1bc');
	console.log(`\x1b[1mWelcome to Casino Table Manager!\x1b[0m\n`);

	console.log(`\x1b[94m--- SERVER STATUS ---------------------------`);
	console.log(`\x1b[94m|\x1b[0m Coordinator Server:  \x1b[92m\x1b[1mRUNNING\x1b[0m\x1b[1m on port ${socketPort}\x1b[0m \x1b[94m|\x1b[0m`);
	console.log(`\x1b[94m|\x1b[0m Frontend Web Server: \x1b[92m\x1b[1mRUNNING\x1b[0m\x1b[1m on port ${webPort}\x1b[0m \x1b[94m|\x1b[0m`);
	console.log(`\x1b[94m---------------------------------------------\n`);

	console.log(`Casino Table Manager is ready at \x1b[94m\x1b[1mhttp://${results[0].address}:${webPort}\x1b[0m\n`);

	console.log('Remember, you can press "h" for help at any time or "e" to exit the Casino Manager\n');
	
})();