import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/framework';

export async function executeFramework(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const frameworkId = execute.getNodeParameter('frameworkId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${frameworkId}` });
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
				body: parseJsonParameter(execute, 'frameworkJson', itemIndex),
			});
		case 'update': {
			const frameworkId = execute.getNodeParameter('frameworkId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${frameworkId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const frameworkId = execute.getNodeParameter('frameworkId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${frameworkId}` });
		}
		default:
			return unsupported(ctx, 'framework');
	}
}
