'use strict';


import logd from 'logd';
import superagent from 'superagent';
import uuid from 'uuid';


const log = logd.module('rda-service-registry-client');





export default class ServiceRegistryClient {


    constructor({
        registryHost,
        serviceName,
        identifier = uuid.v4(),
    }) {
        this.registryHost = registryHost;
        this.identifier = identifier;
        this.serviceName = serviceName;



        // if set top true we've been deregistered
        this.isDeregistered = false;
    }






    /**
    * call the registry in double the required frequency
    */
    async pollRegistry() {
        await this.wait(this.ttl/2);

        // don't update after teh service was deregistred
        if (this.isDeregistered) return;


        // call the regsitry and let them know that we're alive
        superagent.patch(`${this.registryHost}/rda-service-registry.service-instance/${this.identifier}`).ok(res => res.status === 200).send().catch((err) => {
            log.error(err);
        });


        // run again
        this.isDeregistered();
    }





    /**
    * pause :)
    */
    wait(msec) {
        return new Promise((resolve) => {
            this.timeout = setTimeout(resolve, msec);
        })
    }




    /**
    * remove service registration
    */
    async deregister() {
        this.isDeregistered = true;
        clearTimeout(this.timeout);
        await superagent.delete(`${this.registryHost}/rda-service-registry.service-instance/${this.identifier}`).ok(res => res.status === 200).send();
    }




    /**
    * register service
    */
    async register() {
        if (this.isDeregistered) throw new Error(`Cannot register service, it was deregistered and cannot be registered anymore!`);

        const response = await superagent.post(`${this.registryHost}/rda-service-registry.service-instance`).ok(res => res.status === 201).send({
            identifier: this.identifier,
            serviceType: this.serviceName,
        });


        // the registry tells us how often we need to 
        // update our records (convert form sec to msec)
        this.ttl = response.body.ttl*1000;
        

        // start polling the registry, it else will assume 
        // that we have died!
        this.pollRegistry();
    }
}