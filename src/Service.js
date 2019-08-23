import RDAService from '@infect/rda-service';
import path from 'path';
import logd from 'logd';
import Related from 'related';
import RelatedTimestamps from 'related-timestamps';
import ServiceInstanceController from './controller/ServiceInstance.js';



const appRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '../');
const log = logd.module('rda-service-registry');




export default class ServiceRegistry extends RDAService {


    constructor() {
        super({
            name: 'rda-service-registry',
            appRoot, 
        });
    }




    /**
    * prepare the service
    */
    async load() {


        // load database
        this.related = new Related(this.config.db);
        this.related.use(new RelatedTimestamps());

        await this.related.load();
        this.db = this.related[this.config.db.schema];


        const options = {
            db: this.db,
        };


        // register controllers
        this.registerController(new ServiceInstanceController(options));


        // laod the server, det port explicitly
        await super.load(this.config.port);
    }





    /**
    * shut down the service
    */
    async end() {
        await super.end();
        await this.related.end();
    }






    /**
    * returns the current directory for this class
    */
    dirname() {
        return path.join(path.dirname(new URL(import.meta.url).pathname), '../');
    }

}