import { logger } from './misc/logger';
import { AmqpApp } from './amqp-app';

const amqpApp: AmqpApp = new AmqpApp();
logger.info('user-agent started!');

const shutdown = (): void => {
    logger.info('SIGTERM/SIGINT received');
    // Shutdown amqp server
    if (amqpApp) {
        amqpApp.shutdown();
    }
};

process.on('SIGTERM', shutdown);
