'use strict';


const envr = require('envr');


module.exports = {
    port: 9000,
    db: {
        type: 'postgres',
        database: 'infect',
        schema: 'rda_service_registry',
        hosts: [{
            host: 'rda-beta.caygqc7xgkel.eu-west-1.rds.amazonaws.com',
            username: 'root',
            password: envr.get('dbPass'),
            port: 5432,
            pools: ['read', 'write'],
            maxConnections: 20,
        }]
    }
};