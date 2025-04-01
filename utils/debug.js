const debug = require('debug');

module.exports = {
    server: debug('vis-pal:server'),
    api: debug('vis-pal:api'),
    error: debug('vis-pal:error')
};
