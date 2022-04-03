import { AmqpServer } from '../common/amqp';
import { Envs } from './misc/envs';
import logger from './misc/logger';
import { Message } from 'amqplib';
import { IssueResolver } from './service/issue-resolver';
import { IssueResolvingMessage } from './misc/messages';

export class AmqpApp extends AmqpServer {
    private service: IssueResolver;

    constructor(service?: IssueResolver) {
        super({
            brokerUrl: Envs.BROKER_URL,
            publishExchange: Envs.PUBLISH_EXCHANGE_NAME,
            queue: Envs.QUEUE_NAME,
            bindings: [
                {
                    exchange: Envs.USER_AGENT_EXCHANGE_NAME,
                    routingKey: 'issue.resolving',
                },
                {
                    exchange: Envs.USER_AGENT_EXCHANGE_NAME,
                    routingKey: 'issue.resolved',
                },
            ],
        });

        this.start();
        this.service = service || new IssueResolver();
    }

    publishHandler = async (
        exchange: string,
        routingKey: string,
        object: unknown
    ): Promise<void> => {
        let data: Buffer;

        switch (routingKey) {
            case 'issue.received':
                {
                    data = Buffer.from(JSON.stringify(object));
                }
                break;
            default:
                throw new Error(
                    `Publishing of ${routingKey} is not implemented.`
                );
        }

        this.publish(exchange, routingKey, data);
    };

    consumerCallback = async (msg: Message): Promise<void> => {
        switch (msg.fields.routingKey) {
            case 'issue.resolving':
                {
                    let content;

                    try {
                        content = JSON.parse(
                            msg.content.toString()
                        ) as IssueResolvingMessage;

                        if (!content.id || !content.status) {
                            logger.error(
                                `Can not process ${
                                    msg.fields.routingKey
                                } with provided data: ${JSON.stringify(
                                    content
                                )}`
                            );
                            return this.nack(msg, false);
                        }
                    } catch (e) {
                        logger.error(
                            `Could not decode ${msg.fields.routingKey}: `,
                            e
                        );
                        return this.nack(msg, false);
                    }

                    try {
                        await this.service.handleIssueResolving(content);
                        this.ack(msg);
                    } catch (e) {
                        logger.error(
                            `Could not process ${msg.fields.routingKey}: `,
                            e
                        );
                        this.nack(msg, true);
                    }
                }
                break;
            case 'issue.resolved':
                {
                    let content;

                    try {
                        content = JSON.parse(
                            msg.content.toString()
                        ) as IssueResolvingMessage;

                        if (!content.id || !content.status) {
                            logger.error(
                                `Can not process ${
                                    msg.fields.routingKey
                                } with provided data: ${JSON.stringify(
                                    content
                                )}`
                            );
                            return this.nack(msg, false);
                        }
                    } catch (e) {
                        logger.error(
                            `Could not decode ${msg.fields.routingKey}: `,
                            e
                        );
                        return this.nack(msg, false);
                    }

                    try {
                        await this.service.handleIssueResolved(content);
                        this.ack(msg);
                    } catch (e) {
                        logger.error(
                            `Could not process ${msg.fields.routingKey}: `,
                            e
                        );
                        this.nack(msg, true);
                    }
                }
                break;
            default:
                logger.error(
                    `Cannot handle message with routing key ${msg.fields.routingKey}`
                );
                this.nack(msg, false);
                break;
        }
    };
}
