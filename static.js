module.exports = {
    device_type: ['Illuminance', 'Temperature', 'Humidity', 'Pressure', 'Light Control'],
    list_special: ['/3311/0', '/3311/1', '/3311/2'],
    object_device: [
        {
            name: 'Pump 1',
            url: '/3311/0',
            valueId: 5500,
            controlId: 5850,
            unitId: undefined,
            valueType: 'boolean',
            controllable: true
        },
        {
            name: 'Pump 2',
            url: '/3311/1',
            valueId: 5500,
            controlId: 5850,
            unitId: undefined,
            valueType: 'boolean',
            controllable: true
        },
        {
            name: 'Pump 3',
            url: '/3311/2',
            valueId: 5500,
            controlId: 5850,
            unitId: undefined,
            valueType: 'boolean',
            controllable: true
        },
        {
            name: 'Illuminance',
            url: "/3301/0",
            valueId: 5700,
            unitId: 5701,
            valueType: 'number',
        },
        {
            name: 'Temperature',
            url: '/3303/0',
            valueId: 5700,
            unitId: 5701,
            valueType: 'number',
        },
        {
            name: 'Humidity',
            url: '/3304/0',
            valueId: 5700,
            unitId: 5701,
            valueType: 'number',
        },
        {
            name: 'Soil Moisture',
            url: '/3323/0',
            valueId: 5700,
            unitId: 5701,
            valueType: 'number',
        },
        {
            name: 'Soil Temp',
            url: '/3324/0',
            valueId: 5700,
            unitId: 5701,
            valueType: 'number',
        },
    ],
    list_garden: [
        {
            garden_id: 2,
            list_node_name: ['Contiki-NG-1.04B0005B3BFBC', 'Contiki-NG-1.04B0005B3BFDA'],
            device_url: '/3323/0',
            min_range: 170,
            max_range: 800
        }
    ]
}