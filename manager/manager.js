// Imports
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

createApp({
	data() {
		return {
			socket: null,
			isConnected: false,
			isBettingInfoScreenOnline: false,

			table: {
				history: [],
				mode: ''
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
		};
	},
	computed: {
		recents() {
			// Return flipped array of history
			return this.table.history.slice().reverse();
		}
	},
	methods: {
		connectToServer(server = `${location.protocol}//${location.hostname}:3040`) {
			// Connect to the server
			this.socket = io(server + '/manager');
			this.socket.on('connect', () => {
				console.log('Connected to server');
				this.isConnected = true;
			});
			this.socket.on('disconnect', () => {
				console.log('Disconnected from server');
				this.isConnected = false;
			});
			this.socket.on('table.update', (table) => {
				this.table = table;
			});
		},
		sendSpin(spinResult) {
			this.socket.emit('table.spin', spinResult.toString());
		},
		undoSpin() {
			this.socket.emit('table.undoSpin');
		},
		setTableMode(type) {
			this.socket.emit('table.setMode', type);
		}
	},
	watch: {
		'table.mode'(newType) {
			this.setTableMode(newType);
		}
	},
	mounted() {
		this.connectToServer();
	}
}).mount('#app');