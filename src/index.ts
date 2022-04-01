import dataSource from './db/index';
import { Server } from 'http';
import httpApp from './http-app';
import { Envs } from './misc/envs';
import logger from './misc/logger';
import { AmqpApp } from './amqp-app';

let httpServer: Server;
let amqpApp: AmqpApp;

dataSource
    .initialize()
    .then(() => {
        logger.info('Successfully connected to database');

        httpServer = httpApp.listen(Envs.HTTP_PORT, () => {
            logger.info(`HTTP server is listening on ${Envs.HTTP_PORT}`);
        });

        amqpApp = new AmqpApp();
    })
    .catch((err) => {
        logger.error('Failed to connect to database', err);
        process.exit(-1);
    });

const shutdown = (): void => {
    logger.info('SIGTERM/SIGINT received');
    // Shutdown amqp server
    if (amqpApp) {
        amqpApp.shutdown();
    }

    // Shutdown HTTP server
    if (httpServer) {
        httpServer.close((err) => {
            if (err) {
                logger.error('Graceful shutdown', err);
                process.exit(1);
            }

            logger.info('Server stopped');
        });
    }
};

process.on('SIGTERM', shutdown);
