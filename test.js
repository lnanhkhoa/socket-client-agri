
const _ = require('lodash')
var users = [
    { 'user': 'barney', 'age': 36, 'active': false },
    { 'user': 'fred', 'age': 40, 'active': true }
];

const res = _.reject(users, user => !user.active)
console.log(res)


