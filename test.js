const socket = require('socket.io-client')('http://localhost:1234');
socket.emit('my other event', { my: 'after data' });