import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/reporting-cycle';

export async function executeReportingCycle(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'list':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/reporting-cycle-list`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'get': {
			const reportingCycleId = execute.getNodeParameter('reportingCycleId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${reportingCycleId}` });
		}
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'resourceJson', itemIndex),
			});
		case 'update': {
			const reportingCycleId = execute.getNodeParameter('reportingCycleId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${reportingCycleId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const reportingCycleId = execute.getNodeParameter('reportingCycleId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${reportingCycleId}` });
		}
		default:
			return unsupported(ctx, 'reporting cycle');
	}
}
