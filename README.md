# RDA Service Registry

Basically a DNS Server for RDA services. Other services can register, 
de-register themselves and lookup other service. All RDA services register
themselves at the registry in order to be consumable by other RDA services.


Please don't call the API for this service directly, use the the [Client](https://www.npmjs.com/package/@infect/rda-service-registry-client)
instead!


## RESTful API


### Resource rda-service-registry.service-instance

#### GET /rda-service-registry.service-instance?serviceType={serviceName}

Finds all service instances with a given service name. Returns their addresses
so that they can be consumed.



#### POST /rda-service-registry.service-instance

Register a service.

Parameters:
- identifier: uuid v4 string. unique identifier for the service instance
- serviceType: the name of the service (the same name is used when looking up services)
- availableMemory: the amount of memory the service can allocate
- machineId: an unique id for the server the service is running on
- ipv4address or ipv6address: an ipv4 or ipv6 url where the service can be reached



#### PATCH /rda-service-registry.service-instance/{serviceIdentifer}

Tells the registry that the service is still alive. This is required by the 
service registry in order to remove dead hosts. The interval this method has
to be called is returned by the create call as ttl value.



#### DELETE /rda-service-registry.service-instance/{serviceIdentifer}

Remove a service instance from the registry
