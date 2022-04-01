import { AmqpServer } from './amqp';
import { Envs } from './misc/envs';

export class AmqpApp extends AmqpServer {
    constructor() {
        super({
            brokerUrl: Envs.BROKER_URL,
            publishExchange: Envs.PUBLISH_EXCHANGE_NAME,
            queue: Envs.QUEUE_NAME,
        });

        this.start();
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
}
