import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/reports';

export async function executeReport(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const reportId = execute.getNodeParameter('reportId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${reportId}` });
		}
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'getByPeriod':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/by-period`,
				body: parseJsonParameter(execute, 'periodQueryJson', itemIndex),
			});
		case 'checkPublishedExists': {
			const query = parseJsonParameter(execute, 'checkPublishedQuery', itemIndex);
			return request(ctx, { path: `${BASE}/check-published-exists`, qs: query });
		}
		case 'submitForReview': {
			const reportId = execute.getNodeParameter('reportId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${reportId}/submit-for-review`,
				body: parseJsonParameter(execute, 'submitBodyJson', itemIndex),
			});
		}
		case 'approve': {
			const reportId = execute.getNodeParameter('reportId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${reportId}/approve`,
				body: {},
			});
		}
		case 'reject': {
			const reportId = execute.getNodeParameter('reportId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${reportId}/reject`,
				body: parseJsonParameter(execute, 'rejectBodyJson', itemIndex),
			});
		}
		default:
			return unsupported(ctx, 'report');
	}
}
