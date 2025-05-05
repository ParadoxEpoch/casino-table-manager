// Imports
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
//import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { startRotation, moveToNumber } from "../shared/spin.js";

createApp({
	data() {
		return {
			socket: null,
			isConnected: false,

			table: {
				history: [],
				mode: '',
				digitalWheel: true
			},

			tableModes: {
				'twoDollar': {
					name: '$2.50 Roulette',
					colour: '#ffcc00'
				},
				'fiveDollar': {
					name: '$5 Roulette',
					colour: '#e50040'
				},
				'tenDollar': {
					name: '$10 Roulette',
					colour: '#00a0e5'
				},
				'twentyFiveDollar': {
					name: '$25 Roulette',
					colour: '#00b140'
				},
			},
			numbers: {
				'0': 'green',
				/* '00': 'green', */
				'1': 'red',
				'2': 'black',
				'3': 'red',
				'4': 'black',
				'5': 'red',
				'6': 'black',
				'7': 'red',
				'8': 'black',
				'9': 'red',
				'10': 'black',
				'11': 'black',
				'12': 'red',
				'13': 'black',
				'14': 'red',
				'15': 'black',
				'16': 'red',
				'17': 'black',
				'18': 'red',
				'19': 'red',
				'20': 'black',
				'21': 'red',
				'22': 'black',
				'23': 'red',
				'24': 'black',
				'25': 'red',
				'26': 'black',
				'27': 'red',
				'28': 'black',
				'29': 'black',
				'30': 'red',
				'31': 'black',
				'32': 'red',
				'33': 'black',
				'34': 'red',
				'35': 'black',
				'36': 'red'
			}
		}
	},
	computed: {
		recents() {
			// Return flipped array of history
			return this.table.history.slice().reverse();
		},
		sidebarRecents() {
			// Return flipped array of history, limited to 14
			return this.table.history.slice().reverse().slice(0, 14);
		},
		tableId() {
			// Pad history.length with zeros to 4 digits
			return this.table.history.length.toString().padStart(4, '0');
		},
		hotNumbers() {
			// Determine top 4 hot numbers (most frequent) from history
			const counts = {};
			this.table.history.forEach((number) => {
				counts[number] = (counts[number] || 0) + 1;
			});
			const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
			return sorted.slice(0, 4);
		},
		coolNumbers() {
			// Determine top 4 cool numbers (least frequent, or not at all) from history
			const counts = {};
			this.table.history.forEach((number) => {
				counts[number] = (counts[number] || 0) + 1;
			});
			const allNumbers = Object.keys(this.numbers);
			const sorted = allNumbers.filter((number) => !counts[number]).sort((a, b) => (counts[a] || 0) - (counts[b] || 0));
			return sorted.slice(0, 4);
		}
	},
	methods: {
		connectToServer(server = `${location.protocol}//${location.hostname}:3040`) {
			// Connect to the server
			this.socket = io(server + '/client');
			this.socket.on('connect', () => {
				console.log('Connected to server');
				this.isConnected = true;
				this.syncWheelState();
			});
			this.socket.on('disconnect', () => {
				console.log('Disconnected from server');
				this.isConnected = false;
			});
			this.socket.on('table.update', (data) => {
				console.log('Received table update from server:', data);
				this.table = data;
				this.syncWheelState();
			});
			this.socket.on('table.startWheelSpin', async (data) => {
				await startRotation(data.speed);
			});
		},
		refreshTable() {
			// emit history.get with callback to update history
			/* this.socket.emit('history.get', (data) => {
				console.log('Received table history from server:', data);
				this.history = data;
			}); */
			// emit table.getMode with callback to update mode
			console.log('Refreshing table stats...')
			this.socket.emit('table.stats', (data) => {
				console.log('Received table mode from server:', data);
				this.table = data;
				this.syncWheelState();
			});
		},
		syncWheelState() {
			// If there's any history, move to the most recent number
			const lastNumber = this.table.history[this.table.history.length - 1];
			if (lastNumber) moveToNumber(lastNumber);
		}
	},
	mounted() {
		this.connectToServer();
	}
}).mount('#app')