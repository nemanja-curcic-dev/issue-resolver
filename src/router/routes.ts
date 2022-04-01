import express, { Request, Response } from 'express';
import { IssueRepository } from '../db/repository/issue';
import { publish } from '../amqp/index';
import { Envs } from '../misc/envs';
import { TypedRequestBody, CreateIssue, UpdateIssue } from '../misc/types';
import { body, param, validationResult } from 'express-validator';

export const router = express.Router();
const issueRepo = new IssueRepository();

router.get('/', async (_: Request, res: Response) => {
    try {
        const issues = await issueRepo.listIssues();
        return res.status(200).json(issues);
    } catch (e) {
        return res.status(500).json({ detail: (e as Error).message });
    }
});

router.get(
    '/:id',
    param('id').isNumeric(),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = parseInt(req.params.id);
            const issue = await issueRepo.getIssue(id);

            if (!issue) {
                return res
                    .status(404)
                    .json({ detail: `Issue ${id} not found.` });
            }

            return res.status(200).json(issue);
        } catch (e) {
            return res.status(500).json({ detail: (e as Error).message });
        }
    }
);

router.post(
    '/',
    body('title').isString(),
    body('description').isString(),
    async (req: TypedRequestBody<CreateIssue>, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const issue = await issueRepo.saveIssue({
                title: req.body.title,
                description: req.body.description,
                status: 'received',
            });
            await publish(Envs.PUBLISH_EXCHANGE_NAME, 'issue.received', issue);
            return res.status(201).json(issue);
        } catch (e) {
            return res.status(500).json({ detail: (e as Error).message });
        }
    }
);

router.put(
    '/:id',
    param('id').isNumeric(),
    body('title').isString(),
    body('description').isString(),
    body('status').isString(),
    async (req: TypedRequestBody<UpdateIssue>, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = parseInt(req.params.id);
            const issue = await issueRepo.getIssue(id);

            if (!issue) {
                return res.status(404).json(`Issue ${id} not found. `);
            }

            await issueRepo.updateIssue(id, req.body);
            return res
                .status(200)
                .json({ detail: 'Issue is successfully updated.' });
        } catch (e) {
            return res.status(500).json({ detail: (e as Error).message });
        }
    }
);

router.delete(
    '/:id',
    param('id').isNumeric(),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const id = parseInt(req.params.id);
            const issue = await issueRepo.getIssue(id);

            if (!issue) {
                return res
                    .status(404)
                    .json({ detail: `Issue ${id} not found.` });
            }

            await issueRepo.deleteIssue(id);
            return res
                .status(200)
                .json({ detail: 'Issue deleted successfully.' });
        } catch (e) {
            return res.status(500).json({ detail: (e as Error).message });
        }
    }
);
