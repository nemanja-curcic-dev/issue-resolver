/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import amqplib, {Channel, Connection, Message} from 'amqplib';
import EventEmitter from 'events';
import logger from '../../issue-resolver/misc/logger';

export interface PublishConsumeData {
    connection: Connection | null;
    channel: Channel | null;
}

export interface Config {
    brokerUrl: string;
    publishExchange?: string;
    prefetch?: number;
    queue: string;
    bindings?: { exchange: string, routingKey: string }[],
}

class PublishEmitter extends EventEmitter {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publish = async (exchange: string, routingKey: string, object: any) => {
        logger.debug(`Got event to publish to ${exchange} exchange with ${routingKey}: ${JSON.stringify(object)}`);
        this.emit('publish', exchange, routingKey, object);
    };

}

const publishEmitter = new PublishEmitter();
export const publish = publishEmitter.publish;

export class AmqpServer {

    publishData: PublishConsumeData = {
        connection: null,
        channel: null
    };
    consumeData: PublishConsumeData = {
        connection: null,
        channel: null
    };

    publishShutdownCalled = false;

    consumeShutdownCalled = false;

    brokerUrl = '';

    publishExchange: string | undefined = '';

    prefetch = 10;

    queue = '';

    bindings: {exchange: string; routingKey: string}[] = [];

    consumerCallback: ((msg: Message) => void) | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishHandler: undefined | ((exchange: string, routingKey: string, object: any, options: any) => void);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(config: Config, publishHandler?: any) {
        this.brokerUrl = config.brokerUrl;
        this.publishExchange = config.publishExchange;
        this.prefetch = config.prefetch || 10;
        this.queue = config.queue;
        this.bindings = config.bindings || [];
        this.publishHandler = publishHandler;
    }

    start(): void {
        if (this.publishHandler) {
            this.connectPublish();
        }

        if (this.consumerCallback) {
            this.connectConsume();
        }
    }

    async connectPublish() {
        try {
            logger.debug('(Publish) Connecting to broker...');
            this.publishShutdownCalled = false;
            this.publishData.connection = await amqplib.connect(this.brokerUrl);
            logger.info('(Publish) Connected to broker!');

            this.publishData.connection.on('error', (err) => {
                if (this.publishShutdownCalled !== true) {
                    logger.error('(Publish) Connection error', err);
                    setTimeout(async () => {
                        await this.closePublish();
                        await this.connectPublish();
                    }, 5000);
                }
            });
            this.publishData.connection.on('close', () => {
                if (this.publishShutdownCalled !== true) {
                    logger.error('(Publish) Connection closed');
                    setTimeout(async () => {
                        await this.closePublish();
                        await this.connectPublish();
                    }, 5000);
                }
            });

            // eslint-disable-next-line require-atomic-updates
            this.publishData.channel = await this.publishData.connection.createChannel();
            if (this.publishExchange) {
                this.publishData.channel.assertExchange(this.publishExchange, 'topic', {durable: true});
            }

            publishEmitter.on('publish', (exchange, routingKey, object, options) => {
                if (this.publishHandler) {
                    this.publishHandler(exchange, routingKey, object, options);
                }
            });
        } catch (e) {
            logger.error('Failed to connect to AMQP (publish)', e);
            setTimeout(async () => {
                await this.closePublish();
                await this.connectPublish();
            }, 5000);
        }
    }

    async connectConsume() {
        try {
            logger.debug('(Consume) Connecting to broker...');
            this.consumeShutdownCalled = false;
            this.consumeData.connection = await amqplib.connect(this.brokerUrl);
            logger.info('(Consume) Connected to broker!');

            this.consumeData.connection.on('error', (err) => {
                if (this.consumeShutdownCalled !== true) {
                    logger.error('(Consume) Connection error', err);
                    setTimeout(async () => {
                        await this.closeConsume();
                        await this.connectConsume();
                    }, 5000);
                }
            });
            this.consumeData.connection.on('close', () => {
                if (this.consumeShutdownCalled !== true) {
                    logger.error('(Consume) Connection closed');
                    setTimeout(async () => {
                        await this.closeConsume();
                        await this.connectConsume();
                    }, 5000);
                }
            });

            // eslint-disable-next-line require-atomic-updates
            this.consumeData.channel = await this.consumeData.connection.createChannel();
            this.consumeData.channel.prefetch(this.prefetch);
            const q = await this.consumeData.channel.assertQueue(this.queue, {durable: true});

            for (const binding of this.bindings) {
                await this.consumeData.channel.assertExchange(binding.exchange, 'topic', {durable: true});
                await this.consumeData.channel.bindQueue(q.queue, binding.exchange, binding.routingKey);
            }

            this.consumeData.channel.consume(q.queue, async (msg) => {
                if (this.consumerCallback && msg) {
                    this.consumerCallback(msg);
                }
            }, {noAck: false});
        } catch (e) {
            logger.error('Failed to connect to AMQP (consume)', e);
            setTimeout(async () => {
                await this.closeConsume();
                await this.connectConsume();
            }, 5000);
        }
    }

    async shutdown() {
        await this.closeConsume();
        await this.closePublish();
    }

    async closePublish() {
        logger.debug('(Publish) Closing AMQP channels and connections');
        this.publishShutdownCalled = true;

        try {
            if (this.publishData.channel !== null) {
                await this.publishData.channel.close();
            }
        } catch (e) {
            logger.info('(Publish) Failed to close AMQP channel. ', e);
        }
        try {
            if (this.publishData.connection !== null) {
                await this.publishData.connection.close();
            }
        } catch (e) {
            logger.info('(Publish) Failed to close AMQP connection. ', e);
        }

        logger.debug('(Publish) Closed AMQP channels and connections.');
    }

    async closeConsume() {
        logger.debug('(Consume) Closing AMQP channels and connections');
        this.consumeShutdownCalled = true;

        try {
            if (this.consumeData.channel !== null) {
                await this.consumeData.channel.close();
            }
        } catch (e) {
            logger.info('(Consume) Failed to close AMQP channel. ', e);
        }
        try {
            if (this.consumeData.connection !== null) {
                await this.consumeData.connection.close();
            }
        } catch (e) {
            logger.info('(Consume) Failed to close AMQP connection. ', e);
        }

        logger.debug('(Consume) Closed AMQP channels and connections.');
    }

    publish(exchange: string, routingKey: string, buffer: Buffer) {        
        if (this.publishData.channel) {
            this.publishData.channel.publish(exchange, routingKey, buffer);
            logger.debug(`Published message with routingKey ${routingKey}`);
        }
    }

    ack(msg: Message) {
        logger.debug(`Acknowledging ${JSON.stringify(msg.fields.routingKey)}`);
        if (this.consumeData.channel) {
            this.consumeData.channel.ack(msg);
        }
    }

    nack(msg: Message, requeue = true, timeout = 5000) {
        logger.warn(`NOT acknowledging (requeue=${requeue}) in ${requeue ? timeout : 50}ms: ${JSON.stringify(msg.fields.routingKey)}`);
        setTimeout(() => {
            logger.debug(`Now not acknowledging ${JSON.stringify(msg.fields.routingKey)}`);
            if (this.consumeData.channel) {
                this.consumeData.channel.nack(msg, false, requeue);
            }
        }, requeue ? timeout : 50);
    }
}
