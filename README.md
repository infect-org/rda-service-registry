# RDA Service Registry

The service registry knows at all times which service instance is running where.
It is consumed by the RDA-Manager Service which orchestrates the services needed
for the RDA system.

The registry stores its status in a postgres db and is because of that stateless.

## API

### PUT /rda-service-registry.service-instance/:id

This endpoint is used by the services to tell the registry that they are online 
and ready to accept work. Each service needs to call this endpoint every x seconds 
as proof of life. If the service stops calling this endpoint it is assumed to be 
offline.

payload:

```json
{
    serviceType: "rda-compute-node",
    instanceId: "uuid.v4"
}
```


### DELETE /rda-service-registry.service-instance/:id

This endpoint is used by the service instances to remove themselves from the RDA
cluster.


