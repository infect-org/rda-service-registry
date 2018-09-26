import assert from 'assert';
import HTTP2Client from '@distributed-systems/http2-client';
import log from 'ee-log';
import machineId from 'ee-machine-id';
import section from 'section-tests';
import Service from '../index.mjs';



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
        const client = new HTTP2Client().host(host);
        await service.load();


        const id = 'id-'+Math.round(Math.random()*10000000);
        const response = await client.post(`/rda-service-registry.service-instance`)
            .expect(201)
            .send({
                identifier: id,
                serviceType: 'test',
                ipv4address: 'whatever',
                availableMemory: 203984706,
                machineId: machineId(),
            });

        const data = await response.getData();


        assert(data, 'missing response data');
        assert.equal(data.identifier, id)


        await section.wait(200);
        await service.end();
        await client.end();
    });



    section.test('Update an existing Service', async() => {
        const service = new Service();
        const client = new HTTP2Client().host(host);
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice(`Registering Service`);
        const response = await client.post(`/rda-service-registry.service-instance`)
            .expect(201)
            .send({
                identifier: id,
                serviceType: 'test',
                ipv4address: 'whatever',
                availableMemory: 203984706,
                machineId: machineId(),
            });

        const data = await response.getData();


        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice(`Updating Service`);
        const updateResponse = await client.patch(`/rda-service-registry.service-instance/${id}`).expect(200).send();
        const updateData = await updateResponse.getData();


        assert(updateData, 'missing response data');
        assert.equal(updateData.identifier, id);


        await section.wait(200);
        await service.end();
        await client.end();
    });



    section.test('Delete an existing Service', async() => {
        const service = new Service();
        const client = new HTTP2Client().host(host);
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice(`Registering Service`);
        const response = await client.post(`/rda-service-registry.service-instance`)
            .expect(201)
            .send({
                identifier: id,
                serviceType: 'test',
                ipv4address: 'whatever',
                availableMemory: 203984706,
                machineId: machineId(),
            });
        const data = await response.getData();


        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice(`Delete Service`);
        const updateResponse = await client.delete(`/rda-service-registry.service-instance/${id}`).expect(200).send();
        const updateData = await updateResponse.getData();


        assert(updateData, 'missing response data');
        assert.equal(updateData.identifier, id);


        await section.wait(200);
        await service.end();
        await client.end();
    });




    section.test('List active services', async() => {
        const service = new Service();
        const client = new HTTP2Client().host(host);
        await service.load();

        const id = 'id-'+Math.round(Math.random()*10000000);
        
        section.notice(`Registering Service`);
        const response = await client.post(`/rda-service-registry.service-instance`)
            .expect(201)
            .send({
                identifier: id,
                serviceType: 'test',
                ipv4address: 'whatever',
                availableMemory: 203984706,
                machineId: machineId(),
            });
        const data = await response.getData();


        assert(data, 'missing response data');
        assert.equal(data.identifier, id);



        section.notice(`List services`);
        const listResponse = await client.get(`/rda-service-registry.service-instance`)
            .query({
                serviceType: 'test'
            })
            .expect(200)
            .send();
        const listData = await listResponse.getData();

        assert(listData, 'missing response data');
        assert(listData.length);


        await section.wait(200);
        await service.end();
        await client.end();
    });
});