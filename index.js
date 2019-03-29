var socket = require('socket.io-client')('http://localhost:8080');



socket.on('connect', function () {
    console.log('connect')
    // socket.emit('connection/user_join', { currentUserId: '1' })
});
socket.on('event', function (data) {
    console.log('event', data)
});
socket.on('disconnect', function () {
    console.log('disconnect')
});
