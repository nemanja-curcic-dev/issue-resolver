import winston  from 'winston';
import {Envs} from './envs';

export default winston.createLogger({
    level: Envs.LOG_LEVEL,
    format: winston.format.json(),
    defaultMeta: { service: 'user-agent' },
    transports: [
        new winston.transports.Console
    ],
});