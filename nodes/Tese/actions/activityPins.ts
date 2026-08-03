import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { buildReportingContextHeaders, parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/tenant-activity-pins';

export async function executeActivityPins(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getHub':
			return request(ctx, {
				path: BASE,
				headers: buildReportingContextHeaders(execute, itemIndex),
				qs: buildUserQuery(execute, itemIndex),
			});
		case 'updateHub':
			return request(ctx, {
				method: 'PUT',
				path: BASE,
				body: parseJsonParameter(execute, 'hubJson', itemIndex),
			});
		case 'addPin': {
			const questionId = execute.getNodeParameter('questionId', itemIndex) as string;
			const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
			const body: IDataObject = { question_id: questionId };
			if (userId) body.user_id = userId;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/pins`,
				body,
				headers: buildReportingContextHeaders(execute, itemIndex),
			});
		}
		default:
			return unsupported(ctx, 'activity pins');
	}
}

function buildUserQuery(
	execute: ActionContext['execute'],
	itemIndex: number,
): IDataObject | undefined {
	const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
	return userId ? { user_id: userId } : undefined;
}
