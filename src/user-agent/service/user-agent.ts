import { IssueReceivedMessage } from '../misc/messages';
import { publish } from '../../common/amqp';
import { Envs } from '../misc/envs';
import logger from '../misc/logger';

export class UserAgent {
    handleIssueReceived = async (msg: IssueReceivedMessage): Promise<void> => {
        // Publish message and notify issue-resolver that issue is being resolved
        await publish(Envs.PUBLISH_EXCHANGE_NAME, 'issue.resolving', {
            id: msg.id,
            status: 'in-progress',
        });
        // Simulate some work being done
        logger.info('Resolving issue...');
        await new Promise((r) => setTimeout(r, 5000));
        // Publish issue.resolved
        await publish(Envs.PUBLISH_EXCHANGE_NAME, 'issue.resolved', {
            id: msg.id,
            status: 'resolved',
        });
    };
}
