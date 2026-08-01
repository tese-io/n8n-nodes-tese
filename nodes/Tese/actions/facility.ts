import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/facilities';

export async function executeFacility(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll': {
			const page = execute.getNodeParameter('page', itemIndex, 1) as number;
			const limit = execute.getNodeParameter('limit', itemIndex, 50) as number;
			return request(ctx, { path: BASE, qs: { page, limit } });
		}
		case 'get': {
			const facilityId = execute.getNodeParameter('facilityId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${facilityId}` });
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
				body: parseJsonParameter(execute, 'facilityJson', itemIndex),
			});
		case 'update': {
			const facilityId = execute.getNodeParameter('facilityId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${facilityId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const facilityId = execute.getNodeParameter('facilityId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${facilityId}` });
		}
		default:
			return unsupported(ctx, 'facility');
	}
}
