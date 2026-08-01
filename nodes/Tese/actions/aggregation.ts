import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/aggregation';

export async function executeAggregation(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'execute':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/execute`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'preview':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/preview`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'batch':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/batch`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'batchQuestions':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/batch-questions`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'batchAnswers':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/batch-answers`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'portfolioBatchAnswers':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/portfolio-batch-answers`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'forceUpdate':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/force-update`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'health':
			return request(ctx, { path: `${BASE}/health` });
		default:
			return unsupported(ctx, 'aggregation');
	}
}
