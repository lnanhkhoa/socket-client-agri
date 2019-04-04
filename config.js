module.exports = {
    server: {
        host: '45.117.168.231',
        port: 1234,
    },
    host_leshan: process.env.NODE_ENV === 'development' ?
        'http://94517bfd.ap.ngrok.io' : 'http://localhost:8080',
    timeInterval_sendAll: 120000
}