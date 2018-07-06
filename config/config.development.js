'use strict';


const envr = require('envr');


module.exports = {
    port: 8000,
    db: {
        type: 'postgres',
        database: 'infect',
        schema: 'rda_service_registry',
        hosts: [{
            host: '10.80.100.1',
            username: 'postgres',
            password: envr.get('dbPass'),
            port: 5432,
            pools: ['read', 'write'],
            maxConnections: 20,
        }]
    }
};