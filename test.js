
const _ = require('lodash')
var users = [
    { 'user': 'barney', 'age': 36, 'active': false },
    { 'user': 'fred', 'age': 40, 'active': true }
];

const res = _.reject(users, user => !user.active)
console.log(res)




const static = require('./static')
const objectLinks = { url: '/3/0' }

// const { objectLinks, endpoint } = node
const static_object_device = static.object_device;
const listObjectDeviceUrl = _.map(static_object_device, object => object.url)
const list_object_links = _.reject(objectLinks, obj => !_.includes(listObjectDeviceUrl, obj.url));
console.log(list_object_links)


const obje = {
    a: 1,
    b: 2
}
console.log(_.values(obje))
