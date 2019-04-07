const _ = require('lodash')
// const static = require('./static')
const config = require('./config')
const { timeInterval_sendAll } = config
const client = require('socket.io-client')(`http://${config.server.host}:${config.server.port}`);
console.log('connect', `http://${config.server.host}:${config.server.port}`);
// const client = require('socket.io-client')(`http://localhost:1234`);
const fetch = require('node-fetch');
const static = require('./static');

const core = require('./core')
let interval_listener = []


console.log('run NODE_ENV', process.env.NODE_ENV)

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
      try {
        if (!info_node) return consoleCatch({ code: 'info_node_null' })
        if (!!info_node && info_node.length === 0) return consoleCatch({ code: 'info_node_[]' })
        client.emitLog('send_all_state_home', { send_all_state_home: info_node })
      }
      catch (error) {
        console.log('error send_all_state_home', info_node)
      }
    }, timeInterval_sendAll);
    interval_listener.push(instance)


  })
})


function consoleCatch(e) {
  console.log(e)
  return null
}



client.on('command_to_home', async function (payload) {
  console.log('nhận tín hiệu điều khiển từ user')
  const data = payload.data;
  const { node_name, url, value } = data;
  const value_control = value ? 'true' : 'false';
  const object_device = _.find(static.object_device, device => device.url === url);
  const url_link = `${config.host_leshan}/api/clients/${node_name}${url}/${object_device.valueId}?format=TLV`

  // // dev
  // client.emitLog('send_all_state_home', {
  //   send_all_state_home: [],
  //   is_forwarding: true,
  //   info_forwarding: {
  //     to: 'ios',
  //     from: home_info.home_name,
  //     response_command_type: 'remote_device',
  //     data: {
  //       node_name: node_name,
  //       url: url,
  //       value: value,
  //       is_exec: true
  //     }
  //   }
  // })
  // return true




  const response = await core.fetch_put({
    url_link: url_link,
    body: {
      id: object_device.valueId,
      value: value_control
    }
  })
  if (!response.meta.success) return consoleCatch('cant remote')
  const _response_one_node = await core.get_one_node(node_name);
  if (!response_one_node.meta.success) return consoleCatch('cant remote')
  const response_one_node = _response_one_node.body;
  const data_node = await core.get_info_in_one_node(node_name, response_one_node.objectLinks)

  const info_node = [{
    endpoint: response_one_node.endpoint,
    registrationId: response_one_node.registrationId,
    address: response_one_node.address,
    data: data_node
  }]
  try {
    if (!info_node) throw { code: 'info_node_null' }
    if (!!info_node && info_node.length === 0) return consoleCatch({ code: 'info_node_[]' })
    client.emitLog('send_all_state_home', {
      send_all_state_home: info_node,
      is_forwarding: true,
      info_forwarding: {
        to: 'ios',
        from: home_info.home_name,
        response_command_type: 'remote_device',
        data: {
          node_name: node_name,
          url: url,
          value: value,
          is_exec: !!response.meta.success
        }
      }
    })
  }
  catch (error) {
    console.log('error send_all_state_home', info_node)
  }
  // phản hồi trạng thái từ tín hiệu 
})



// const emitResponse = function (data_response) {
//   client.emitLog(emit_type.response_from_home_to_user, data_response)

// }



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

