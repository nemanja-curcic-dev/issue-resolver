import { Repository } from 'typeorm';
import dataSource from '../index';
import { Issue } from '../models/issue';
import { logger } from '../../misc/logger';
import { UpdateIssue } from '../../misc/types';

export class IssueRepository {
    repo: Repository<Issue>;

    constructor() {
        this.repo = dataSource.getRepository(Issue);
    }

    getIssue = async (id: number): Promise<Issue | null> => {
        logger.debug(`Getting issue with id ${id}... `);
        return await this.repo.findOne({
            where: {
                id: id,
            },
        });
    };

    saveIssue = async (issue: Issue): Promise<Issue> => {
        logger.debug(
            `Saving new issue to database with title ${issue.title}... `
        );
        return await this.repo.save(issue);
    };

    listIssues = async (): Promise<Issue[]> => {
        logger.debug('Listing all issues... ');
        const issues = await this.repo.find({});
        logger.debug(`Got ${issues.length} issues. `);
        return issues;
    };

    deleteIssue = async (id: number): Promise<void> => {
        logger.debug(`Deleting issue ${id}... `);
        await this.repo.delete({ id: id });
    };

    updateIssue = async (id: number, data: UpdateIssue): Promise<void> => {
        logger.debug(`Updating issue ${id}... `);
        await this.repo.update(
            { id: id },
            {
                title: data.title,
                description: data.description,
                status: data.status,
            }
        );
    };

    setStatus = async (id: number, status: string): Promise<void> => {
        logger.debug(`Setting status ${status} for id ${id}... `);
        await this.repo.update(
            {
                id: id,
            },
            {
                status: status,
            }
        );
    };
}
