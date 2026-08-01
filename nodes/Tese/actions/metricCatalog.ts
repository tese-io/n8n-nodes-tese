import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, splitCodes, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/metric-catalog';

export async function executeMetricCatalog(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll': {
			const page = execute.getNodeParameter('page', itemIndex, 1) as number;
			const limit = execute.getNodeParameter('limit', itemIndex, 50) as number;
			return request(ctx, { path: BASE, qs: { page, limit } });
		}
		case 'get': {
			const metricId = execute.getNodeParameter('metricId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${metricId}` });
		}
		case 'getByFramework': {
			const frameworkId = execute.getNodeParameter('frameworkId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/framework/${frameworkId}` });
		}
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'resolveByCodes': {
			const codes = splitCodes(execute.getNodeParameter('codes', itemIndex, '') as string);
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/resolve-by-codes`,
				body: { codes },
			});
		}
		case 'getFilters':
			return request(ctx, { path: `${BASE}/filters` });
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'metricJson', itemIndex),
			});
		case 'update': {
			const metricId = execute.getNodeParameter('metricId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${metricId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const metricId = execute.getNodeParameter('metricId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${metricId}` });
		}
		default:
			return unsupported(ctx, 'metric catalog');
	}
}
