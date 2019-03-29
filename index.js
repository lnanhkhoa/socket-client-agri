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


//Get Lux value of 4c18
fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3301/0/5700?format=TLV')
    .then(res => res.json())
    .then(body => {
        const Lux_4C18 = body.content.value;
        // console.log(list_value)
        // const value5700 = _.find(list_value, 
        //     function(i) {
        //     return (i.id === 5700)
        // })
        console.log(Lux_4C18)

    });
//Get Air temp of 4c18
fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3303/0/5700?format=TLV')
    .then(res => res.json())
    .then(body => {
        const Air_temp_4C18 = body.content.value;
        // console.log(list_value)
        // const value5700 = _.find(list_value, 
        //     function(i) {
        //     return (i.id === 5700)
        // })
        console.log(Air_temp_4C18)
        //console.log("Air temp")

    });
//Get Air humidity of 4c18
fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3304/0/5700?format=TLV')
    .then(res => res.json())
    .then(body => {
        const Air_humidity_4C18 = body.content.value;
        // console.log(list_value)
        // const value5700 = _.find(list_value, 
        //     function(i) {
        //     return (i.id === 5700)
        // })
        console.log(Air_humidity_4C18)

    });
fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4BFB/3301/0/5700?format=TLV')
    .then(res => res.json())
    .then(body => {
        const Lux_4BFB = body.content.value;
        // console.log(list_value)
        // const value5700 = _.find(list_value, 
        //     function(i) {
        //     return (i.id === 5700)
        // })
        console.log(Lux_4BFB)

    });

    