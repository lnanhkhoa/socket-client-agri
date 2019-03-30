const _ = require('lodash')
const client = require('socket.io-client')('http://localhost:1234');
const fetch = require('node-fetch');

const core = require('./core')
let interval_listener = []

const user_info = {
    user_name: 'ios',
    token_key: 'ios_android_secret'
}

const emit_type = {
    user_join: 'connection/user_join',
    command_to_home_from_user: 'command_to_home_from_user',
    get_all_home_state: 'get_all_home_state'
}




client.emitLog = (event, data, callback) => {
    client.emit(event, data, res => {
        console.log(new Date(), event, data, res)
        if (!!callback) callback()
    })
}

client.on('disconnect', function () {
    console.log('disconnect')
    interval_listener.forEach(element => {
        clearInterval(element)
    });
    interval_listener = []
});

client.on('connect', function () {
    
    // Emit connect device_join
    let data_user_join = {
        user_name: user_info.user_name,
        token_key: user_info.token_key
    }
    client.emitLog(emit_type.user_join, data_user_join, (res_join_room) => {

        // control device
        client.emitLog(emit_type.command_to_home_from_user, {
            from: user_info.user_name,
            to: 'lesharn_08042019',
            command_type: 'remote_device',
            data: { 
                node_name: 'main',
                device_name: 'light',
                value: 'true'
             }
        })

        // client.emit(emit_type.get_all_home_state, data, (res) => {
        //     console.log('all home state', res)
        // })
    });
});

client.on('response_to_user', function (data) {
    console.log('user đã nhận được response từ home', data)
})


module.exports = client;










