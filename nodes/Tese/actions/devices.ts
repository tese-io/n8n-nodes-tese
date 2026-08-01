import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/devices';

export async function executeDevices(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const deviceId = execute.getNodeParameter('deviceId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${deviceId}` });
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
			const deviceId = execute.getNodeParameter('deviceId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${deviceId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const deviceId = execute.getNodeParameter('deviceId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${deviceId}` });
		}
		default:
			return unsupported(ctx, 'devices');
	}
}
