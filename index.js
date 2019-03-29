const socket = require('socket.io-client')('http://localhost:1234');
const fetch = require('node-fetch');
const _ = require('lodash')


socket.on('connect', function () {
    let event = 'connection/user_join';
    let data = {
        user_id: 'lesharn'
    };

    // Emit connect
    socket.emit(event, data, (result) => {
        console.log(event, data, result)
    });

});
socket.on('get_state_all_devices', function (data) {
    console.log('event', data)

    const list = [{ id: 1, value: 1 }, { id: 2, value: 3 }]
    const data_feedback = {
        res: list
    }
    socket.emit('event', data_feedback, function (res) {
        console.log(`send event`, data_feedback, res)
    })

});
socket.on('disconnect', function () {
    console.log('disconnect')

});


// //Get Lux value of 4c18
// fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3301/0/5700?format=TLV')
//     .then(res => res.json())
//     .then(body => {
//         const Lux_4C18 = body.content.value;
//         // console.log(list_value)
//         // const value5700 = _.find(list_value, 
//         //     function(i) {
//         //     return (i.id === 5700)
//         // })
//         console.log(Lux_4C18)

//     });
// //Get Air temp of 4c18
// fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3303/0/5700?format=TLV')
//     .then(res => res.json())
//     .then(body => {
//         const Air_temp_4C18 = body.content.value;
//         // console.log(list_value)
//         // const value5700 = _.find(list_value, 
//         //     function(i) {
//         //     return (i.id === 5700)
//         // })
//         console.log(Air_temp_4C18)
//         //console.log("Air temp")

//     });
// //Get Air humidity of 4c18
// fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4C18/3304/0/5700?format=TLV')
//     .then(res => res.json())
//     .then(body => {
//         const Air_humidity_4C18 = body.content.value;
//         // console.log(list_value)
//         // const value5700 = _.find(list_value, 
//         //     function(i) {
//         //     return (i.id === 5700)
//         // })
//         console.log(Air_humidity_4C18)

//     });
// fetch('http://localhost:8080/api/clients/Contiki-NG-1.04B0005AF4BFB/3301/0/5700?format=TLV')
//     .then(res => res.json())
//     .then(body => {
//         const Lux_4BFB = body.content.value;
//         // console.log(list_value)
//         // const value5700 = _.find(list_value, 
//         //     function(i) {
//         //     return (i.id === 5700)
//         // })
//         console.log(Lux_4BFB)

//     });

