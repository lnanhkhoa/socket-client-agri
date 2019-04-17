const _ = require('lodash')
// const static = require('./static')
const config = require('./config')
const { timeInterval_sendAll } = config
const serverHost = `http://${config.server.host}:${config.server.port}`
const client = require('socket.io-client')(serverHost);
console.log('connect', serverHost);
const static = require('./static');

const core = require('./core')
let interval_listener = {}
let timeout_listener = {}
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

let payload_config = []

client.emitLog = (event, data, callback) => {
  client.emit(event, data, res => {
    console.log(new Date(), event, data, res)
    if (!!callback) callback()
  })
}


client.on('disconnect', function () {
  console.log('disconnect')
  _.values(interval_listener).forEach(element => {
    clearInterval(element)
  });
  _.values(timeout_listener).forEach(element => {
    clearTimeout(element)
  });
  interval_listener = {}
  timeout_listener = {}
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
    await update_all_node()
    const instance = setInterval(async () => {
      await update_all_node()
    }, timeInterval_sendAll);
    interval_listener.send_info = instance

    // update payload_config
    payload_config = await get_config_remote()
    await remote_pump_auto()
    setIntervalRemote()

  })
})


function setIntervalRemote(params) {
  clearInterval(interval_listener.update_config)
  const instance1 = setInterval(async () => {
    payload_config = await get_config_remote()
    // remote pump from humidity sensor value
    await remote_pump_auto()
  }, 3600 * 1000);
  interval_listener.update_config = instance1
}



async function update_all_node() {
  const info_node = await core.get_all_info();
  try {
    if (!info_node) return consoleCatch({ code: 'info_node_null' })
    if (!!info_node && info_node.length === 0) return consoleCatch({ code: 'info_node_[]' })
    client.emitLog('send_all_state_home', { send_all_state_home: info_node })
  }
  catch (error) {
    console.log('error send_all_state_home', info_node)
  }
}

function consoleCatch(e) {
  console.log(e)
  return null
}


client.on('command_to_home', async function (payload) {
  console.log('nhận tín hiệu điều khiển từ user', payload)

  const data = payload.data;
  const { node_name, url, value } = data;
  const command_type = payload.command_type;

  const value_control = value ? 'true' : 'false';
  const object_device = _.find(static.object_device, device => device.url === url);



  const response = await (async () => {
    if (command_type !== 'remote_device') return { meta: { success: true } }
    const url_link = `${config.host_leshan}/api/clients/${node_name}${url}/${object_device.controlId}?format=TLV`
    const response = await core.fetch_put({
      url_link: url_link,
      body: {
        id: object_device.controlId,
        value: value_control
      }
    })
    return response
  })()
  if (!response.meta.success) return consoleCatch('cant remote')


  // get data

  const info_node = await (async () => {
    if (command_type !== 'remote_device') return await core.get_all_info();
    const _response_one_node = await core.get_one_node(node_name);
    if (!_response_one_node.meta.success) return consoleCatch('_cant remote_')
    const response_one_node = _response_one_node.body;

    const data_node = await core.get_info_in_one_node(node_name, response_one_node.objectLinks)

    const static_object_device = static.object_device;
    const listObjectDeviceUrl = _.map(static_object_device, object => object.url)
    const list_object_links = _.reject(data_node, obj => !_.includes(listObjectDeviceUrl, obj.url));

    const info_node = [{
      endpoint: response_one_node.endpoint,
      registrationId: response_one_node.registrationId,
      address: response_one_node.address,
      data: list_object_links
    }]
    return info_node
  })()


  try {
    if (!info_node) throw { code: 'info_node_null' }
    if (!!info_node && info_node.length === 0) return consoleCatch({ code: 'info_node_[]' })
    client.emitLog('send_all_state_home', {
      send_all_state_home: info_node,
      is_forwarding: true,
      info_forwarding: {
        to: 'ios',
        from: home_info.home_name,
        response_command_type: command_type,
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



async function get_config_remote(params) {
  const response = await core.fetch_get(`${serverHost}/api/config/get?home_name=${home_info.home_name}`)
  if (!response.meta.success) return undefined
  return response.body.data
}



async function remote_pump_auto(params) {
  payload_config = (!!payload_config && payload_config.length === 0) ? await get_config_remote() : payload_config
  const info_node = await core.get_all_info();
  if (info_node.length === 0) return null

  await _.forEach(static.list_garden, async static_garden => {

    const garden_index = static_garden.garden_id
    const static_garden_one = _.find(static.list_garden, gar => gar.garden_id === garden_index)
    // data in process
    const list_node_in_garden = _.filter(info_node, node => {
      return _.includes(static_garden_one.list_node, node.endpoint)
    })
    if (list_node_in_garden.length === 0) return null

    const getListHumidityInGarden = async (list_node_in_garden, static_garden_one) => {
      return list_node_in_garden.map(node => {
        const list_data_device = node.data;
        const data_soil_moisture = _.find(list_data_device, device =>
          device.url === static_garden_one.device_url
        )
        return data_soil_moisture
      })
    }
    const list_humidity = await getListHumidityInGarden(list_node_in_garden, static_garden_one)
    const _list_humidity_vals = list_humidity.map(i => i.value)
    const _list_humidity_values = _list_humidity_vals.map(value => {
      if (value > 1000) return null
      if (value < 0) return null
      return value
    })

    const list_humidity_values = _.compact(_list_humidity_values)
    if (list_humidity_values.length === 0) return null
    const real_mean_humidity_val = _.mean(list_humidity_values);I
    // reference
    const config_garden_one = _.find(payload_config, config => {
      return config.object_type === 'GARDEN' && config.object_id === garden_index
    })
    if (real_mean_humidity_val > config_garden_one.mean_humidity_value) return null

    console.info(new Date(), `Real Mean Humidity value < value_in_Config, so turn the Pump in Garden`, _list_humidity_values)

    // turn ON/OFF PUMP
    await core.turn_on_pump(garden_index - 1)
    timeout_listener[`remote_pump_auto_${garden_index}`] = setTimeout(async () => {
      await core.turn_off_pump(garden_index - 1)
    }, config_garden_one.about_time * 60 * 1000);


  });


}


client.on('config_remote_pump_automatically', async function (payload) {
  // like get_config_remote
  const list_config = payload.data.list_data
  payload_config = list_config
  await remote_pump_auto()
  setIntervalRemote()

})



module.exports = client;
