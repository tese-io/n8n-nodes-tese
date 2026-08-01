import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { parseJsonParameter, request, unsupported } from './helpers';

const BASE = '/api/v3/external/task-manager/approvals';

export async function executeTaskApproval(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;

	switch (operation) {
		case 'list': {
			const qs: IDataObject = {};
			const status = execute.getNodeParameter('status', itemIndex, '') as string;
			const entityType = execute.getNodeParameter('entityType', itemIndex, '') as string;
			const entityId = execute.getNodeParameter('entityId', itemIndex, '') as string;
			const reviewerId = execute.getNodeParameter('reviewerId', itemIndex, '') as string;
			if (status) qs.status = status;
			if (entityType) qs.entity_type = entityType;
			if (entityId) qs.entity_id = entityId;
			if (reviewerId) qs.reviewer_id = reviewerId;
			return request(ctx, { path: `${BASE}/list`, qs });
		}
		case 'get': {
			const approvalId = execute.getNodeParameter('approvalId', itemIndex) as string;
			return request(ctx, { path: `${BASE}/${approvalId}` });
		}
		case 'pendingCount':
			return request(ctx, { path: `${BASE}/pending-count` });
		case 'approve': {
			const approvalId = execute.getNodeParameter('approvalId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${approvalId}/approve`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'reject': {
			const approvalId = execute.getNodeParameter('approvalId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/${approvalId}/reject`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'entityApprove': {
			const entityType = execute.getNodeParameter('entityType', itemIndex) as string;
			const entityId = execute.getNodeParameter('entityId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/entity/${entityType}/${entityId}/approve`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		case 'entityReject': {
			const entityType = execute.getNodeParameter('entityType', itemIndex) as string;
			const entityId = execute.getNodeParameter('entityId', itemIndex) as string;
			return request(ctx, {
				method: 'POST',
				path: `${BASE}/entity/${entityType}/${entityId}/reject`,
				body: parseJsonParameter(execute, 'requestBodyJson', itemIndex),
			});
		}
		default:
			return unsupported(ctx, 'task approval');
	}
}
