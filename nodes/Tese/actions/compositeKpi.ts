import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/composite-kpi';

export async function executeCompositeKpi(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'list':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/list`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'analytics':
			return request(ctx, { path: `${BASE}/analytics` });
		case 'get': {
			const compositeKpiId = execute.getNodeParameter('compositeKpiId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${compositeKpiId}` });
		}
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'resourceJson', itemIndex),
			});
		case 'update': {
			const compositeKpiId = execute.getNodeParameter('compositeKpiId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${compositeKpiId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const compositeKpiId = execute.getNodeParameter('compositeKpiId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${compositeKpiId}` });
		}
		case 'calculate': {
			const compositeKpiId = execute.getNodeParameter('compositeKpiId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${compositeKpiId}/calculate`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		default:
			return unsupported(ctx, 'composite KPI');
	}
}
