const { Server } = require('socket.io');

async function init(socketPort) {
	const io = new Server(socketPort, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		}
	});

	const manager = io.of('/manager');
	const client = io.of('/client');

	const table = {
		history: ['29', '32', '0', '20', '23', '32', '26', '3', '17', '12', '15', '28', '27', '3'],
		mode: 'fiveDollar',
		digitalWheel: true // set to true for a digital wheel
	};

	manager.on('connection', (socket) => {
		console.log('Manager connected');
		manager.emit('table.update', table);

		socket.on('disconnect', () => {
			console.log('Manager disconnected');
		});

		function syncTable() {
			client.emit('table.update', table);
			manager.emit('table.update', table);
		}

		socket.on('table.spin', (number) => {
			table.history.push(number);
			syncTable();
		});
		socket.on('table.undoSpin', () => {
			table.history.pop();
			syncTable();
		});
		socket.on('table.setMode', (mode) => {
			table.mode = mode;
			syncTable();
		});
		socket.on('table.setDigitalWheel', (digitalWheel) => {
			table.digitalWheel = digitalWheel;
			syncTable();
		});
		socket.on('table.requestWheelSpin', (data) => {
			client.emit('table.startWheelSpin', data);
			manager.emit('table.startWheelSpin', data);
		});

		// On table.stats, send table data to manager
		socket.on('table.stats', (callback) => callback(table));

		/* socket.onAny((eventName, ...args) => {
			console.log('GOT MANAGER EVENT:', eventName, args);
			console.log('Propagating to client...');
			client.emit(eventName, ...args);
		}); */
	});

	client.on('connection', (socket) => {
		console.log('Client connected');
		client.emit('table.update', table);

		socket.on('disconnect', () => {
			console.log('Client disconnected');
		});
		// On table.stats, send table data to client
		socket.on('table.stats', (callback) => callback(table));
	});
}

module.exports = {
	init: init
};