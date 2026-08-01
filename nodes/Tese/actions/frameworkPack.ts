import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/framework-pack';

export async function executeFrameworkPack(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const assessmentId = execute.getNodeParameter('assessmentId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${assessmentId}` });
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
			const assessmentId = execute.getNodeParameter('assessmentId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${assessmentId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const assessmentId = execute.getNodeParameter('assessmentId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${assessmentId}` });
		}
		default:
			return unsupported(ctx, 'framework pack');
	}
}
