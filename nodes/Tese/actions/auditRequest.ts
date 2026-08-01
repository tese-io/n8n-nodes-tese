import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/audit-requests';

export async function executeAuditRequest(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'fql':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/fql`,
				body: parseJsonParameter(execute, 'fqlBody', itemIndex),
			});
		case 'get': {
			const auditRequestId = execute.getNodeParameter('auditRequestId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${auditRequestId}` });
		}
		case 'getByStatus': {
			const status = execute.getNodeParameter('status', itemIndex) as string;
			return request(ctx, { path: `${BASE}/status/${status}` });
		}
		case 'getUserAccessible':
			return request(ctx, { path: `${BASE}/user/accessible` });
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'auditRequestJson', itemIndex),
			});
		case 'update': {
			const auditRequestId = execute.getNodeParameter('auditRequestId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${auditRequestId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'addMessage': {
			const auditRequestId = execute.getNodeParameter('auditRequestId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${auditRequestId}/messages`,
				body: parseJsonParameter(execute, 'messageJson', itemIndex),
			});
		}
		case 'delete': {
			const auditRequestId = execute.getNodeParameter('auditRequestId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${auditRequestId}` });
		}
		default:
			return unsupported(ctx, 'audit request');
	}
}
