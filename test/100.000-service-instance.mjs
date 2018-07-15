'use strict';

import Service from '../index.mjs';
import section from 'section-tests';
import request from 'superagent';
import assert from 'assert';
import log from 'ee-log';



const host = 'http://l.dns.porn:9000';



section('RDA Service Registry', (section) => {

    section.test('Start & stop service', async() => {
        const service = new Service();

        await service.load();
        await section.wait(200);
        await service.end();
    });

    section.test('Register a new Service', async() => {
        const service = new Service();
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        

        const response = await request.post(`${host}/rda-service-registry.service-instance`).ok(res => res.status === 201).send({
            identifier: id,
            serviceType: 'test',
            ipv4address: 'whatever',
        });
        const data = response.body;


        assert(data, 'missing response data');
        assert.equal(data.identifier, id)


        await section.wait(200);
        await service.end();
    });



    section.test('Update an existing Service', async() => {
        const service = new Service();
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice(`Registering Service`);
        const response = await request.post(`${host}/rda-service-registry.service-instance`).ok(res => res.status === 201).send({
            identifier: id,
            serviceType: 'test',
            ipv4address: 'whatever',
        });
        const data = response.body;


        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice(`Updating Service`);
        const updateResponse = await request.patch(`${host}/rda-service-registry.service-instance/${id}`).ok(res => res.status === 200).send();
        const updateData = updateResponse.body;


        assert(updateData, 'missing response data');
        assert.equal(updateData.identifier, id);



        await section.wait(200);
        await service.end();
    });



    section.test('Delete an existing Service', async() => {
        const service = new Service();
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice(`Registering Service`);
        const response = await request.post(`${host}/rda-service-registry.service-instance`).ok(res => res.status === 201).send({
            identifier: id,
            serviceType: 'test',
            ipv4address: 'whatever',
        });
        const data = response.body;


        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice(`Delete Service`);
        const updateResponse = await request.delete(`${host}/rda-service-registry.service-instance/${id}`).ok(res => res.status === 200).send();
        const updateData = updateResponse.body;


        assert(updateData, 'missing response data');
        assert.equal(updateData.identifier, id);


        await section.wait(200);
        await service.end();
    });




    section.test('List active services', async() => {
        const service = new Service();
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice(`Registering Service`);
        const response = await request.post(`${host}/rda-service-registry.service-instance`).ok(res => res.status === 201).send({
            identifier: id,
            serviceType: 'test',
            ipv4address: 'whatever',
        });
        const data = response.body;


        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice(`List services`);
        const listResponse = await request.get(`${host}/rda-service-registry.service-instance`).query({
            serviceType: 'test'
        }).ok(res => res.status === 200).send();
        const listData = listResponse.body;

        assert(listData, 'missing response data');
        assert(listData.length);


        await section.wait(200);
        await service.end();
    });
});