import { Request } from 'express';

export interface TypedRequestBody<T> extends Request {
    body: T;
}

export interface CreateIssue {
	title: string;
	description: string;
}

export interface UpdateIssue extends CreateIssue {
	status: string;
} 