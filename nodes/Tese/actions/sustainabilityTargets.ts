import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/sustainability-targets';

export async function executeSustainabilityTargets(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const targetId = execute.getNodeParameter('targetId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${targetId}` });
		}
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'analyticsLegend':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/analytics-legend-data`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'resourceJson', itemIndex),
			});
		case 'update': {
			const targetId = execute.getNodeParameter('targetId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${targetId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const targetId = execute.getNodeParameter('targetId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${targetId}` });
		}
		default:
			return unsupported(ctx, 'sustainability targets');
	}
}
