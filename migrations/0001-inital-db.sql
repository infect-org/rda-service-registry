drop schema if exists rda_service_registry cascade;
create schema  if not exists rda_service_registry;

set search_path to rda_service_registry;



create table rda_service_registry."serviceType" (
    id serial not null,
    identifier varchar(200) not null,
    constraint "serviceType_pk" 
        primary key (id)
);


create table rda_service_registry."serviceInstance" (
    id serial not null,
    identifier varchar(100) not null,
    ipv4address varchar (300),
    ipv6address varchar (300),
    "id_serviceType" int not null,
    created timestamp without time zone not null default now(),
    updated timestamp without time zone not null default now(),
    deleted timestamp without time zone,
    constraint "serviceInstance_pk" 
        primary key (id),
    constraint "serviceInstance_fk_serviceType"
        foreign key ("id_serviceType")
        references "serviceType" ("id")
        on update cascade
        on delete restrict,
    constraint "serviceInstance_unique_identifier"
        unique ("identifier"),
    constraint "serviceInstance_check_address_not_null"
        check ("ipv4address" is not null or "ipv6address" is not null)
);