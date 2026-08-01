import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/spt';

export async function executeSpt(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const sptId = execute.getNodeParameter('sptId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${sptId}` });
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
				body: parseJsonParameter(execute, 'resourceJson', itemIndex),
			});
		case 'update': {
			const sptId = execute.getNodeParameter('sptId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${sptId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const sptId = execute.getNodeParameter('sptId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${sptId}` });
		}
		default:
			return unsupported(ctx, 'SPT');
	}
}
