import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/task-manager/workflows';

export async function executeTaskWorkflow(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'forEntity': {
			const entityType = execute.getNodeParameter('entityType', itemIndex) as string;
			return request(ctx, { path: `${BASE}/for-entity/${entityType}` });
		}
		case 'validateTransition':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/validate-transition`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		default:
			return unsupported(ctx, 'task workflow');
	}
}
