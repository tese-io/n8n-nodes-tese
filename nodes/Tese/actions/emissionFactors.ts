import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/emission-factors';

export async function executeEmissionFactors(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'get': {
			const factorId = execute.getNodeParameter('factorId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${factorId}` });
		}
		default:
			return unsupported(ctx, 'emission factors');
	}
}
