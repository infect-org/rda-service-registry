'use strict';


import {Controller} from 'rda-service';
import type from 'ee-types';
import logd from 'logd';


const log = logd.module('rda-service-registry');



export default class ServiceInstanceController extends Controller {


    constructor({db}) {
        super('service-instance');

        this.db = db;

        this.enableAction('update');
        this.enableAction('create');
        this.enableAction('delete');
        this.enableAction('list');


        // time until a service is seen as dead
        this.serviceTTL = 30;
    }





    /**
    * list service that are online of a certain type
    */
    async list(request, response) {
        const serviceType = request.query.serviceType;


        if (!type.string(serviceType)) response.status(400).send(`Missing parameter 'serviceType' in the requests query!`);
        else {
            const thirtySecondsAgo = new Date();
            thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds()-this.serviceTTL);


            return await this.db.serviceInstance('*', {
                updated: this.db.getORM().gt(thirtySecondsAgo)
            }).getServiceType({
                identifier: serviceType
            }).find();
        }  
    }










    /**
    * register a new service
    */
    async create(request, response) {
        const data = request.body;
        
        if (!data) response.status(400).send(`Missing request body!`);
        else if (!type.object(data)) response.status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.identifier)) response.status(400).send(`Missing parameter 'identifier' in request body!`);
        else if (!type.string(data.serviceType)) response.status(400).send(`Missing parameter 'serviceType' in request body!`);
        else if (!type.number(data.availableMemory)) response.status(400).send(`Missing parameter 'availableMemory' in request body!`);
        else if (!type.string(data.ipv4address) && !type.string(data.ipv6address)) response.status(400).send(`Missing parameter 'ipv4address' or 'ipv6address' in request body!`);
        else {


            // make sure the service type exists
            let serviceType = await this.db.serviceType('*', {
                identifier: data.serviceType
            }).findOne();

            if (!serviceType) {
                serviceType = await new this.db.serviceType({
                    identifier: data.serviceType
                }).save();
            }


            // register instance
            let instance = await new this.db.serviceInstance({
                identifier: data.identifier,
                updated: new Date(),
                serviceType: serviceType,
                availableMemory: data.availableMemory,
                ipv6address: data.ipv6address,
                ipv4address: data.ipv4address,
            }).save();


            log.info(`Successfully registered service instance '${data.identifier}' of type ${data.serviceType} ...`);

            // set the ttl interval on the response so the
            // client knows how often to call the registry
            instance = instance.toJSON();
            instance.ttl = this.serviceTTL;

            return instance;
        }
    }






    /**
    * keep the service alive by calling this enpoint
    */
    async update(request, response) {
        const identifier = request.params.id;

        if (!type.string(identifier)) response.status(400).send(`Missing parameter 'identifier' in the request url!`);
        else {
            const instance = await this.db.serviceInstance('*', {
                identifier: identifier
            }).findOne();

            if (instance) {
                instance.updated = new Date();


                log.debug(`Updating registered service instance '${instance.identifier}' ...`);

                return await instance.save();
            } else response.status(404).send(`Service instance '${identifier}' not found!`);
        }
    }






    /**
    * de-register a service instance
    */
    async delete(request, response) {
        const identifier = request.params.id;

        if (!type.string(identifier)) response.status(400).send(`Missing parameter 'identifier' in the request url!`);
        else {
            const instance = await this.db.serviceInstance('*', {
                identifier: identifier
            }).findOne();

            if (instance) {
                instance.deleted = new Date();

                log.info(`Removing registered service instance '${instance.identifier}' ...`);

                return await instance.save();
            } else response.status(404).send(`Service instance '${identifier}' not found!`);
        }
    }
}