import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/question-bank';

export async function executeQuestionBank(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'getActivityInputs':
			return request(ctx, { path: `${BASE}/activity-inputs` });
		case 'get': {
			const questionId = execute.getNodeParameter('questionId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${questionId}` });
		}
		default:
			return unsupported(ctx, 'question bank');
	}
}
