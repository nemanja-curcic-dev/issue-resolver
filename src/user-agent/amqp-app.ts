import { Message } from 'amqplib';
import { AmqpServer } from '../common/amqp';
import logger from './misc/logger';
import { Envs } from './misc/envs';
import { IssueReceivedMessage } from './misc/messages';
import { UserAgent } from './service/user-agent';

export class AmqpApp extends AmqpServer {
    private service: UserAgent;

    constructor(service?: UserAgent) {
        super({
            brokerUrl: Envs.BROKER_URL,
            publishExchange: Envs.PUBLISH_EXCHANGE_NAME,
            queue: Envs.QUEUE_NAME,
            prefetch: Envs.PREFETCH,
            bindings: [
                {
                    exchange: Envs.ISSUE_RESOLVER_EXCHANGE_NAME,
                    routingKey: 'issue.received',
                },
            ],
        });

        this.start();
        this.service = service || new UserAgent();
    }

    publishHandler = async (
        exchange: string,
        routingKey: string,
        object: unknown
    ): Promise<void> => {
        let data: Buffer;

        switch (routingKey) {
            case 'issue.resolving':
                {
                    data = Buffer.from(JSON.stringify(object));
                }
                break;
            case 'issue.resolved':
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
            case 'issue.received':
                {
                    let content;

                    try {
                        content = JSON.parse(
                            msg.content.toString()
                        ) as IssueReceivedMessage;

                        if (
                            !content.id ||
                            !content.title ||
                            !content.description ||
                            !content.status
                        ) {
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
                        // simulate some work being done
                        // publish message with status as resolved
                        await this.service.handleIssueReceived(content);
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
