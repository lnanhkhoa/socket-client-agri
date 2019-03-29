const socket = require('socket.io-client')('http://localhost:1234');
const fetch = require('node-fetch');
const _ = require('lodash')


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



fetch('http://172.16.0.249:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3301/0?format=TLV')
    .then(res => res.json())
    .then(body => {
        const list_value = body.content.resources;
        // console.log(list_value)
        const value5700 = _.find(list_value, 
            function(i) {
            return (i.id === 5700)
        })
        console.log(value5700)

    });


    