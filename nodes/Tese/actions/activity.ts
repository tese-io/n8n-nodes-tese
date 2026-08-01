import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/activity-store';

export async function executeActivity(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll': {
			const page = execute.getNodeParameter('page', itemIndex, 1) as number;
			const limit = execute.getNodeParameter('limit', itemIndex, 50) as number;
			return request(ctx, { path: BASE, qs: { page, limit } });
		}
		case 'get': {
			const activityId = execute.getNodeParameter('activityId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${activityId}` });
		}
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'activityJson', itemIndex),
			});
		case 'update': {
			const activityId = execute.getNodeParameter('activityId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${activityId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'archive': {
			const activityId = execute.getNodeParameter('activityId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${activityId}` });
		}
		default:
			return unsupported(ctx, 'activity');
	}
}
