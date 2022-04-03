/* eslint-disable no-process-env */

export class Envs {
    public static LOG_LEVEL: string = (
        process.env.LOG_LEVEL || 'debug'
    ).toLowerCase();

	public static BROKER_URL: string = process.env.BROKER_URL || 'amqp://rabbitmq:rabbitmq@localhost:5672/';
	public static PUBLISH_EXCHANGE_NAME: string = process.env.PUBLISH_EXCHANGE_NAME || 'user-agent-exchange';
	public static QUEUE_NAME: string = process.env.QUEUE_NAME || 'user-agent-queue';
	// set prefetch to 1 by default so that user-agent can handle only one issue
	public static PREFETCH: number = parseInt(process.env.PREFETCH || '1');
	public static ISSUE_RESOLVER_EXCHANGE_NAME: string = process.env.ISSUE_RESOLVER_EXCHANGE_NAME || 'issue-resolver-exchange';
}