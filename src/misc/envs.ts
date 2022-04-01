/* eslint-disable no-process-env */

export class Envs {
    public static LOG_LEVEL: string = (
        process.env.LOG_LEVEL || 'debug'
    ).toLowerCase();

	public static HTTP_PORT: number = parseInt(process.env.HTTP_PORT || '3000');

	public static DATABASE_URL: string = process.env.DATABASE_URL || 'mysql://issueresolver:issueresolver@localhost:3306/issueresolver';

	public static BROKER_URL: string = process.env.BROKER_URL || 'amqp://rabbitmq:rabbitmq@localhost:5672/';
	public static PUBLISH_EXCHANGE_NAME: string = process.env.PUBLISH_EXCHANGE_NAME || 'issue-resolver-exchange';
	public static QUEUE_NAME: string = process.env.QUEUE_NAME || 'issue-resolver-queue';
}
