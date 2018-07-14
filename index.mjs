'use strict';

import Service from './src/Service';
import RegistryClient from './src/RegistryClient';
import logd from 'logd';
import ConsoleTransport from 'logd-console-transport';

// enable console logging
logd.transport(new ConsoleTransport());



export {
    RegistryClient, 
    Service as default
};