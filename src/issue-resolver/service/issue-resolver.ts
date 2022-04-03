import { IssueRepository } from '../db/repository/issue';
import { IssueResolvingMessage } from '../misc/messages';

export class IssueResolver {
    private repository: IssueRepository;

    constructor(repository?: IssueRepository) {
        this.repository = repository || new IssueRepository();
    }

    handleIssueResolving = async (
        msg: IssueResolvingMessage
    ): Promise<void> => {
        await this.repository.setStatus(msg.id, msg.status);
    };

    handleIssueResolved = async (msg: IssueResolvingMessage): Promise<void> => {
        await this.repository.setStatus(msg.id, msg.status);
    };
}
