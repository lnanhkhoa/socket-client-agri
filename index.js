const _ = require('lodash')
const config = require('./config')
const { timeInterval_sendAll } = config
const client = require('socket.io-client')(`http://${config.server.host}`);
const fetch = require('node-fetch');
const static = require('./static');

const core = require('./core')
let interval_listener = []

const home_info = {
  home_name: 'leshan_08042019',
  token_key: 'leshan_08042019_secret'
}

const emit_type = {
  home_join: 'connection/home_join',
  response_from_home_to_user: 'response_from_home_to_user',
  send_all_state_home: 'send_all_state_home'
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
  let event = emit_type.home_join;
  let data = {
    home_name: home_info.home_name,
    token_key: home_info.token_key
  };

  // Emit connect home_join
  client.emitLog(event, data, async result => {

    // interval send home info
    const instance = setInterval(async () => {
      const info_node = await core.get_all_info();
      console.log(info_node)
      try {
        if (!info_node) throw { code: 'info_node_null' }
        if (!!info_node && info_node.length === 0) throw { code: 'info_node_[]' }
        client.emitLog('send_all_state_home', { send_all_state_home: info_node })
      }
      catch (error) {
        console.log('error send_all_state_home', info_node)
      }
    }, timeInterval_sendAll);
    interval_listener.push(instance)

    // send response
    // emitResponse({
    //   to: 'ios',
    //   from: home_info.home_name,
    //   response_command_type: 'remote_device',
    //   data: {
    //     node_name: 'main',
    //     device_name: 'light',
    //     value: 'true',
    //     is_exec: true
    //   }
    // })


  })
})



client.on('command_to_home', function (data) {
  console.log('nhận tín hiệu điều khiển từ user', data)

  // phản hồi trạng thái từ tín hiệu 
})

client.on('get_state_all_devices', function (data) {
  const list = [{ id: 1, value: 1 }, { id: 2, value: 3 }]
  const data_feedback = {
    res: list
  }
  client.emit('event', data_feedback, function (res) {
    console.log(`send event`, data_feedback, res)
  })
});



const emitResponse = function (data_response) {
  client.emitLog(emit_type.response_from_home_to_user, data_response)

}



module.exports = client;












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

