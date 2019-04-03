const _ = require('lodash')
const fetch = require('node-fetch')
const static = require('./static');
const config = require('./config')
const core = {}
const host_leshan = config.host_leshan;

const list_apis = {
    get_all_node_name: '/api/clients'
}

core.get_info_node = () => ({
    node_name: 'abc',
    data: [
        { id: 1, value: 1 },
        { id: 2, value: 3 }
    ]
})


const fetch_get = async url_link => {
    let response = undefined
    try {
        response = await fetch(url_link)
            .then(r => r.json().then(data => ({ status: r.status, meta: { success: true }, body: data })))
    } catch (e) {
        console.log(e)
        return { status: 500, meta: { success: false }, code: 'response_body_not_found' };
    }
    // if (!response || response.status != 200) throw { code: 'error' };
    // if (!response.body) throw { code: 'response_body_not_found' };
    return response
}

core.get_all_node = async () => {
    const url = `${host_leshan}${list_apis.get_all_node_name}`
    console.log(url)
    const response = await fetch_get(url)
    const list_node_name = response.meta.success ? response.body : [];
    // console.log(list_node_name)
    return list_node_name.map(node => ({
        endpoint: node.endpoint,
        registrationId: node.registrationId,
        address: node.address,
        lifetime: node.lifetime,
        objectLinks: node.objectLinks
    }))
}


core.get_info_in_one_node = async (endpoint, list_objectLinks) => {
    const list_pm_resources = list_objectLinks.map(async device => {
        let returnNull = { url: device.url, }
        if (device.url === '/3/0') return returnNull

        const static_object_device = static.object_device;
        const object_device = _.find(static_object_device, _device => _device.url === device.url);
        if (!object_device) return returnNull

        const response = await fetch_get(`${host_leshan}/api/clients/${endpoint}${device.url}?format=TLV`)
        if (!response.meta.success) return returnNull

        const response_list_value = response.body.content.resources;
        const value_object = _.find(response_list_value, res => res.id === object_device.valueId);
        if (typeof value_object.value !== object_device.valueType) return returnNull
        const unit_object = _.find(response_list_value, res => res.id === object_device.unitId);

        return {
            name: object_device.name,
            url: device.url,
            value: value_object.value,
            unit: unit_object ? unit_object.value : undefined,
            // data: response.body.content.resources
        }
    })
    return await Promise.all(list_pm_resources)
}

core.get_all_info = async () => {
    const all_node = await core.get_all_node()
    // // const list_endpoint_all_node = all_node.map(node => node.endpoint)

    return await Promise.all(all_node.map(async node => {
        const { objectLinks, endpoint } = node
        const static_object_device = static.object_device;
        const listObjectDeviceUrl = _.map(static_object_device, object => object.url)
        const list_object_links = _.reject(objectLinks, obj => !_.includes(listObjectDeviceUrl, obj.url));
        const data_node = await core.get_info_in_one_node(endpoint, list_object_links)
        return {
            ..._.omit(node, ['objectLinks', 'lifetime']),
            data: data_node
        }
    }))


}


// core.get_info_all_node = () => {
//     fetch(`${host_leshan}/api/clients/Contiki-NG-1.04B0005B3BFB2/3311/0?format=TLV`)
// }


module.exports = core