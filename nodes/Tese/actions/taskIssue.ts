import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/task-manager/issues';

export async function executeTaskIssue(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'myTasks':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/my-tasks`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'get': {
			const issueId = execute.getNodeParameter('issueId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${issueId}` });
		}
		case 'update': {
			const issueId = execute.getNodeParameter('issueId', itemIndex) as string;
			return request(ctx, {
				method: 'PATCH',
				path: `${BASE}/${issueId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'review': {
			const issueId = execute.getNodeParameter('issueId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${issueId}/review`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		default:
			return unsupported(ctx, 'task issue');
	}
}
