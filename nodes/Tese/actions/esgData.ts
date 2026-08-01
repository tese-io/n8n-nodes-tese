import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/esg-data';

export async function executeEsgData(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'getByDateRange': {
			const startDate = execute.getNodeParameter('startDate', itemIndex) as string;
			const endDate = execute.getNodeParameter('endDate', itemIndex) as string;
			return request(ctx, { path: `${BASE}/date-range`, qs: { startDate, endDate } });
		}
		case 'getByCategory': {
			const category = execute.getNodeParameter('category', itemIndex) as string;
			return request(ctx, { path: `${BASE}/category/${encodeURIComponent(category)}` });
		}
		case 'get': {
			const esgDataId = execute.getNodeParameter('esgDataId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${esgDataId}` });
		}
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'esgDataJson', itemIndex),
			});
		case 'update': {
			const esgDataId = execute.getNodeParameter('esgDataId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${esgDataId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const esgDataId = execute.getNodeParameter('esgDataId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${esgDataId}` });
		}
		default:
			return unsupported(ctx, 'ESG data');
	}
}
