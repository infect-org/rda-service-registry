'use strict';

import Service, {RegistryClient} from '../index.mjs';
import section from 'section-tests';
import assert from 'assert';
import log from 'ee-log';



const host = 'http://l.dns.porn:8000';



section('RDA Service Registry Client', (section) => {

    section.test('Register and deregister', async() => {
        
        section.notice('starting the service');
        const service = new Service();
        await service.load();


        const client = new RegistryClient({
            registryHost: host,
            serviceName: 'cielt-test',
        });


        section.notice('registering');
        await client.register();


        assert(client.ttl);


        section.notice('de-registering');
        await client.deregister();


        await section.wait(200);
        await service.end();
    });
});