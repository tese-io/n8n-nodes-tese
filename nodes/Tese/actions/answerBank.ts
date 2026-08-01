import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/answer-bank';

export async function executeAnswerBank(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const answerId = execute.getNodeParameter('answerId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${answerId}` });
		}
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'answerBankJson', itemIndex),
			});
		case 'update': {
			const answerId = execute.getNodeParameter('answerId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${answerId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const answerId = execute.getNodeParameter('answerId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${answerId}` });
		}
		case 'carbonSummary':
			return request(ctx, { path: `${BASE}/carbon-summary` });
		case 'uniqueMetrics':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/unique-metrics`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'auditMetricsAnswers':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/audit-metrics-answers`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		default:
			return unsupported(ctx, 'answer bank');
	}
}
