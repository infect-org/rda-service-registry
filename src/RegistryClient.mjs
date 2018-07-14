'use strict';


import logd from 'logd';
import superagent from 'superagent';
import uuid from 'uuid';
import os from 'os';


const log = logd.module('rda-service-registry-client');





export default class ServiceRegistryClient {


    constructor({
        registryHost,
        serviceName,
        webserverPort,
        identifier = uuid.v4(),
        protocol = 'http://'
    }) {
        this.registryHost = registryHost;
        this.identifier = identifier;
        this.serviceName = serviceName;
        this.webserverPort = webserverPort;
        this.protocol = protocol;



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
        this.pollRegistry();
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
        if (!this.webserverPort) throw new Error(`Cannot register service, the webserver port (webserverPort) was not passed to the constructor!`);

        // get network interfaces, use the first ipv4
        // and the first ipv6 interfaces that are not 
        // private or internal
        const addresses = this.getPublicNetworkInterfaces();


        const response = await superagent.post(`${this.registryHost}/rda-service-registry.service-instance`).ok(res => res.status === 201).send({
            identifier: this.identifier,
            serviceType: this.serviceName,
            ipv4address: addresses.ipv4 ? `${this.protocol}${addresses.ipv4}:${this.webserverPort}` : null,
            ipv6address: addresses.ipv6 ? `${this.protocol}${addresses.ipv6}:${this.webserverPort}` : null,
        });


        // the registry tells us how often we need to 
        // update our records (convert from sec to msec)
        this.ttl = response.body.ttl*1000;
        

        // start polling the registry, it else will assume 
        // that we have died!
        this.pollRegistry();
    }





    /**
    * get the first ipv4 and ipv6 interfaces that
    * are publicly accessible
    */
    getPublicNetworkInterfaces() {
        const interfaces = os.networkInterfaces();
        const interfaceNames = Object.keys(interfaces);
        const result = {};

        for (const interfaceName of interfaceNames) {
            for (const networkInterface of interfaces[interfaceName]) {
                if (!networkInterface.internal) {
                    if (!result[networkInterface.family.toLowerCase()]) {
                        result[networkInterface.family.toLowerCase()] = networkInterface.address;
                    }
                }
            }
        }

        return result;
    }






    /**
    * do a lookup and get the address for a service
    */
    async resolve(serviceName, {
        family = 'ipv4',
        timeout = 2000 
    } = {}) {
        const response = await superagent.get(`${this.registryHost}/rda-service-registry.service-instance`).timeout({
            deadline: timeout
        }).ok(res => res.status === 200).query({
            serviceType: serviceName
        }).send();

        const addresses = response.body;

        if (addresses.length) {
            const index = Math.floor(Math.random()*addresses.length);

            if (family === 'ipv4') {
                if (addresses[index].ipv4address) return addresses[index].ipv4address;
                else throw new Error(`Failed to resolve address for service '${serviceName}': the service has no IPv4 address registered!`);
            } else {
                if (addresses[index].ipv6address) return addresses[index].ipv6address;
                else throw new Error(`Failed to resolve address for service '${serviceName}': the service has no IPv6 address registered!`);
            }
        } else throw new Error(`Failed to resolve address for service '${serviceName}': service not found!`);
    }
}