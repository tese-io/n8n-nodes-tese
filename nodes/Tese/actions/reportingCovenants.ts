import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/reporting-covenants';

export async function executeReportingCovenants(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'getAll':
			return request(ctx, { path: BASE });
		case 'dashboard':
			return request(ctx, { path: `${BASE}/dashboard` });
		case 'deals':
			return request(ctx, { path: `${BASE}/deals` });
		case 'submissions':
			return request(ctx, { path: `${BASE}/submissions` });
		case 'createSubmission':
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/submissions`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		case 'approve': {
			const covenantId = execute.getNodeParameter('covenantId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${covenantId}/approve`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'updateAssignees': {
			const covenantId = execute.getNodeParameter('covenantId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${covenantId}/assignees`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'updateApprovers': {
			const covenantId = execute.getNodeParameter('covenantId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/${covenantId}/approvers`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'approveSubmission': {
			const submissionId = execute.getNodeParameter('submissionId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/submissions/${submissionId}/approve`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'rejectSubmission': {
			const submissionId = execute.getNodeParameter('submissionId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/submissions/${submissionId}/reject`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'waiveSubmission': {
			const submissionId = execute.getNodeParameter('submissionId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/submissions/${submissionId}/waive`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'updateSubmission': {
			const submissionId = execute.getNodeParameter('submissionId', itemIndex) as string;
			return request(ctx, {
				method: 'PUT',
				path: `${BASE}/submissions/${submissionId}`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		default:
			return unsupported(ctx, 'reporting covenants');
	}
}
