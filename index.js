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
    console.log(new Date(), event, data)
    console.log("----------------------------------------------")
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
  clearAllIntervalRemote()
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
    const config_isallowed = payload_config.filter(cf => !!cf.status)
    await remote_pump_auto(config_isallowed)
    await setIntervalRemote(config_isallowed)
  })
})

function clearAllIntervalRemote() {
  const list_idInterval = _.values(interval_listener.update_config)
  clearInterval(list_idInterval)
}

async function setIntervalRemote(payload_config) {
  clearAllIntervalRemote()
  payload_config.forEach((config, index) => {
    const cycle_time = config.cycle_time || 1;
    const instance = setInterval(async () => {
      // remote pump from humidity sensor value
      await remote_pump_auto([config])
    }, cycle_time * 60 * 1000 + index * 408);
    interval_listener.update_config = {
      [index]: instance
    }
  })
}

function sendNotiToUser({ message, node_info }) {
  console.log('node_info', node_info)
  client.emitLog('send_all_state_home', {
    send_all_state_home: [node_info],
    is_forwarding: true,
    info_forwarding: {
      to: 'ios',
      from: home_info.home_name,
      response_command_type: 'need_update',
      data: {
        status: JSON.stringify({ message: message })
      }
    }
  })
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


async function get_garden_info(params) {
  const response = await core.fetch_get(
    `${serverHost}/api/garden/get_info?user_name=ios&user_token_key=ios_android_secret&home_name=${home_info.home_name}`)
  if (!response.meta.success) return undefined
  return response.body.data
}



async function remote_pump_auto(payload_config) {
  if (!!payload_config && payload_config.length === 0) return null
  const info_node = await core.get_all_info();
  if (info_node.length === 0) return null
  const static_list_garden = await get_garden_info()

  // const list_garden_onStatus = payload_config.filter(i => !!i.status)

  _.forEach(static_list_garden, async static_garden => {
    // reference
    const garden_index = static_garden.garden_id

    const config_garden_one = _.find(payload_config, config => {
      return config.object_type === 'GARDEN'
        && config.object_id === garden_index
        && config.status === true
    })

    if (!config_garden_one) return consoleCatch({ code: 'garden_is_off' })


    const __static_garden_one = _.find(static.list_garden, gar => gar.garden_id === garden_index)
    const _static_garden_one = _.find(static_list_garden, gar => gar.garden_id === garden_index)
    const static_garden_one = { ...__static_garden_one, ..._static_garden_one }
    // data in process
    const list_node_in_garden = _.filter(info_node, node => {
      return _.includes(static_garden_one.list_node_name, node.endpoint)
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
    const __list_humidity_values = _list_humidity_vals.map(value => {
      if (value > 1000) return null
      if (value < 0) return null
      return value
    })

    const _list_humidity_values = _.compact(__list_humidity_values)

    //validate
    const list_humidity_values = _.reject(_list_humidity_values, val => val < 170 || val > 850)
    if (list_humidity_values.length === 0) return null
    const real_mean_humidity_val = _.mean(list_humidity_values)


    if (real_mean_humidity_val > config_garden_one.mean_humidity_value) {
      console.info(new Date(), `Real Mean Humidity value(${real_mean_humidity_val}) > value_in_Config(${config_garden_one.mean_humidity_value}), so do nothing`, _list_humidity_values)
      return null
    }

    console.info(new Date(), `Real Mean Humidity value(${real_mean_humidity_val}) < value_in_Config(${config_garden_one.mean_humidity_value}), so turn on the Pump in Garden`, _list_humidity_values)

    // turn ON/OFF PUMP
    const resOn = await core.turn_on_pump(garden_index - 1)
    const data_node_control = await core.get_all_one_node('Contiki-NG-1.04B0005B3BFB2')
    if (!!resOn) sendNotiToUser({
      message: `pump${garden_index} ON`,
      node_info: data_node_control
    })
    timeout_listener[`remote_pump_auto_${garden_index}`] = setTimeout(async () => {
      const resOff = await core.turn_off_pump(garden_index - 1)
      const _data_node_control = await core.get_all_one_node('Contiki-NG-1.04B0005B3BFB2')
      if (!!resOff) sendNotiToUser({
        message: `pump${garden_index} OFF`,
        node_info: _data_node_control
      })
    }, config_garden_one.about_time * 60 * 1000);


  });


}

client.on('config_remote_pump_automatically', async function (payload) {
  // like get_config_remote
  const list_config = payload.data.list_data
  payload_config = list_config
  const config_isallowed = payload_config.filter(cf => !!cf.status)
  await setIntervalRemote(config_isallowed)
  await remote_pump_auto(config_isallowed)
})



module.exports = client;
