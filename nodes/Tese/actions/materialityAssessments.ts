import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/materiality-assessments';

export async function executeMaterialityAssessments(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'summary':
			return request(ctx, { path: `${BASE}/summary` });
		case 'create':
			return request(ctx, {
				method: 'POST',
				path: BASE,
				body: parseJsonParameter(execute, 'resourceJson', itemIndex),
			});
		case 'update': {
			const recordId = execute.getNodeParameter('recordId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${recordId}`,
				body: parseJsonParameter(execute, 'updatesJson', itemIndex),
			});
		}
		case 'delete': {
			const recordId = execute.getNodeParameter('recordId', itemIndex) as string;
			return request(ctx, { method: 'DELETE', path: `${BASE}/${recordId}` });
		}
		case 'publish': {
			const recordId = execute.getNodeParameter('recordId', itemIndex) as string;
			return request(ctx, { method: 'POST', path: `${BASE}/${recordId}/publish`, body: {} });
		}
		case 'unpublish': {
			const recordId = execute.getNodeParameter('recordId', itemIndex) as string;
			return request(ctx, { method: 'POST', path: `${BASE}/${recordId}/unpublish`, body: {} });
		}
		default:
			return unsupported(ctx, 'materiality assessments');
	}
}
