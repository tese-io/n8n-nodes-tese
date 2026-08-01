import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/formula/execution';

export async function executeFormulaExecution(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'execute':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/execute`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'batchExecute':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/batch-execute`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		default:
			return unsupported(ctx, 'formula execution');
	}
}
