import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/framework-pack-answer';

export async function executeFrameworkPackAnswer(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const answerId = execute.getNodeParameter('frameworkPackAnswerId', itemIndex) as string;
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
				body: parseJsonParameter(execute, 'resourceJson', itemIndex),
			});
		case 'update': {
			const answerId = execute.getNodeParameter('frameworkPackAnswerId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${answerId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const answerId = execute.getNodeParameter('frameworkPackAnswerId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${answerId}` });
		}
		default:
			return unsupported(ctx, 'framework pack answer');
	}
}
