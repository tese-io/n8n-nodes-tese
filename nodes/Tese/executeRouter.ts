import type { IDataObject, IExecuteFunctions, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { teseApiRequest, type TeseApiCredentials } from '../shared/teseApiRequest';

function parseJsonParameter(
	executeFunctions: IExecuteFunctions,
	parameterName: string,
	itemIndex: number,
): IDataObject {
	const raw = executeFunctions.getNodeParameter(parameterName, itemIndex, '{}') as
		| string
		| IDataObject;
	if (typeof raw === 'object' && raw !== null) return raw as IDataObject;
	try {
		return JSON.parse(String(raw || '{}')) as IDataObject;
	} catch {
		throw new NodeOperationError(executeFunctions.getNode(), `Invalid JSON in "${parameterName}"`, {
			itemIndex,
		});
	}
}

function splitCodes(codes: string): string[] {
	return codes
		.split(',')
		.map((code) => code.trim())
		.filter(Boolean);
}

function simplifyResponse(data: unknown): IDataObject {
	if (data === null || data === undefined) return {};
	if (Array.isArray(data)) {
		return { items: data, count: data.length };
	}
	if (typeof data === 'object') {
		const obj = data as IDataObject;
		if (Array.isArray(obj.data)) {
			return { items: obj.data, count: obj.data.length, ...(obj.meta ? { meta: obj.meta } : {}) };
		}
		if (Array.isArray(obj.items)) {
			return { items: obj.items, count: obj.items.length };
		}
		return obj;
	}
	return { value: data };
}

function wrapResponse(data: unknown, simplify: boolean): IDataObject {
	if (simplify) return simplifyResponse(data);
	if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
		return data as IDataObject;
	}
	return { data: data as IDataObject };
}

async function executeFacility(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/facilities';

	switch (operation) {
		case 'getAll': {
			const page = this.getNodeParameter('page', itemIndex, 1) as number;
			const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
			const data = await teseApiRequest.call(this, credentials, {
				path: base,
				qs: { page, limit },
			});
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const facilityId = this.getNodeParameter('facilityId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${facilityId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'fql': {
			const fqlBody = parseJsonParameter(this, 'fqlBody', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/fql`,
				body: fqlBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'create': {
			const facility = parseJsonParameter(this, 'facilityJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: base,
				body: facility,
			});
			return wrapResponse(data, simplify);
		}
		case 'update': {
			const facilityId = this.getNodeParameter('facilityId', itemIndex) as string;
			const updates = parseJsonParameter(this, 'updatesJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'PUT',
				path: `${base}/${facilityId}`,
				body: updates,
			});
			return wrapResponse(data, simplify);
		}
		case 'delete': {
			const facilityId = this.getNodeParameter('facilityId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'DELETE',
				path: `${base}/${facilityId}`,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unsupported facility operation: ${operation}`, {
				itemIndex,
			});
	}
}

async function executeActivity(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/esg/activity-store';

	switch (operation) {
		case 'getAll': {
			const page = this.getNodeParameter('page', itemIndex, 1) as number;
			const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
			const data = await teseApiRequest.call(this, credentials, {
				path: base,
				qs: { page, limit },
			});
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const activityId = this.getNodeParameter('activityId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${activityId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'create': {
			const activity = parseJsonParameter(this, 'activityJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: base,
				body: activity,
			});
			return wrapResponse(data, simplify);
		}
		case 'update': {
			const activityId = this.getNodeParameter('activityId', itemIndex) as string;
			const updates = parseJsonParameter(this, 'updatesJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'PUT',
				path: `${base}/${activityId}`,
				body: updates,
			});
			return wrapResponse(data, simplify);
		}
		case 'archive': {
			const activityId = this.getNodeParameter('activityId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'DELETE',
				path: `${base}/${activityId}`,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unsupported activity operation: ${operation}`, {
				itemIndex,
			});
	}
}

async function executeMetricCatalog(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/esg/metric-catalog';

	switch (operation) {
		case 'getAll': {
			const page = this.getNodeParameter('page', itemIndex, 1) as number;
			const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
			const data = await teseApiRequest.call(this, credentials, {
				path: base,
				qs: { page, limit },
			});
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const metricId = this.getNodeParameter('metricId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${metricId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'getByFramework': {
			const frameworkId = this.getNodeParameter('frameworkId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/framework/${frameworkId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'fql': {
			const fqlBody = parseJsonParameter(this, 'fqlBody', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/fql`,
				body: fqlBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'resolveByCodes': {
			const codes = splitCodes(this.getNodeParameter('codes', itemIndex, '') as string);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/resolve-by-codes`,
				body: { codes },
			});
			return wrapResponse(data, simplify);
		}
		case 'getFilters': {
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/filters`,
			});
			return wrapResponse(data, simplify);
		}
		case 'create': {
			const metric = parseJsonParameter(this, 'metricJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: base,
				body: metric,
			});
			return wrapResponse(data, simplify);
		}
		case 'update': {
			const metricId = this.getNodeParameter('metricId', itemIndex) as string;
			const updates = parseJsonParameter(this, 'updatesJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'PUT',
				path: `${base}/${metricId}`,
				body: updates,
			});
			return wrapResponse(data, simplify);
		}
		case 'delete': {
			const metricId = this.getNodeParameter('metricId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'DELETE',
				path: `${base}/${metricId}`,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported metric catalog operation: ${operation}`,
				{ itemIndex },
			);
	}
}

async function executeEsgData(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/esg/esg-data';

	switch (operation) {
		case 'fql': {
			const fqlBody = parseJsonParameter(this, 'fqlBody', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/fql`,
				body: fqlBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'getByDateRange': {
			const startDate = this.getNodeParameter('startDate', itemIndex) as string;
			const endDate = this.getNodeParameter('endDate', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/date-range`,
				qs: { startDate, endDate },
			});
			return wrapResponse(data, simplify);
		}
		case 'getByCategory': {
			const category = this.getNodeParameter('category', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/category/${encodeURIComponent(category)}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const esgDataId = this.getNodeParameter('esgDataId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${esgDataId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'create': {
			const esgData = parseJsonParameter(this, 'esgDataJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: base,
				body: esgData,
			});
			return wrapResponse(data, simplify);
		}
		case 'update': {
			const esgDataId = this.getNodeParameter('esgDataId', itemIndex) as string;
			const updates = parseJsonParameter(this, 'updatesJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'PUT',
				path: `${base}/${esgDataId}`,
				body: updates,
			});
			return wrapResponse(data, simplify);
		}
		case 'delete': {
			const esgDataId = this.getNodeParameter('esgDataId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'DELETE',
				path: `${base}/${esgDataId}`,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unsupported ESG data operation: ${operation}`, {
				itemIndex,
			});
	}
}

async function executeFramework(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/esg/framework';

	switch (operation) {
		case 'getAll': {
			const data = await teseApiRequest.call(this, credentials, { path: base });
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const frameworkId = this.getNodeParameter('frameworkId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${frameworkId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'fql': {
			const fqlBody = parseJsonParameter(this, 'fqlBody', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/fql`,
				body: fqlBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'create': {
			const framework = parseJsonParameter(this, 'frameworkJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: base,
				body: framework,
			});
			return wrapResponse(data, simplify);
		}
		case 'update': {
			const frameworkId = this.getNodeParameter('frameworkId', itemIndex) as string;
			const updates = parseJsonParameter(this, 'updatesJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'PUT',
				path: `${base}/${frameworkId}`,
				body: updates,
			});
			return wrapResponse(data, simplify);
		}
		case 'delete': {
			const frameworkId = this.getNodeParameter('frameworkId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'DELETE',
				path: `${base}/${frameworkId}`,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported framework operation: ${operation}`,
				{
					itemIndex,
				},
			);
	}
}

async function executeAuditRequest(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/audit-requests';

	switch (operation) {
		case 'fql': {
			const fqlBody = parseJsonParameter(this, 'fqlBody', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/fql`,
				body: fqlBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const auditRequestId = this.getNodeParameter('auditRequestId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${auditRequestId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'getByStatus': {
			const status = this.getNodeParameter('status', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/status/${status}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'getUserAccessible': {
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/user/accessible`,
			});
			return wrapResponse(data, simplify);
		}
		case 'create': {
			const auditRequest = parseJsonParameter(this, 'auditRequestJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: base,
				body: auditRequest,
			});
			return wrapResponse(data, simplify);
		}
		case 'update': {
			const auditRequestId = this.getNodeParameter('auditRequestId', itemIndex) as string;
			const updates = parseJsonParameter(this, 'updatesJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'PUT',
				path: `${base}/${auditRequestId}`,
				body: updates,
			});
			return wrapResponse(data, simplify);
		}
		case 'addMessage': {
			const auditRequestId = this.getNodeParameter('auditRequestId', itemIndex) as string;
			const message = parseJsonParameter(this, 'messageJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/${auditRequestId}/messages`,
				body: message,
			});
			return wrapResponse(data, simplify);
		}
		case 'delete': {
			const auditRequestId = this.getNodeParameter('auditRequestId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'DELETE',
				path: `${base}/${auditRequestId}`,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported audit request operation: ${operation}`,
				{ itemIndex },
			);
	}
}

async function executeReport(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const base = '/api/v3/external/reports';

	switch (operation) {
		case 'getAll': {
			const data = await teseApiRequest.call(this, credentials, { path: base });
			return wrapResponse(data, simplify);
		}
		case 'get': {
			const reportId = this.getNodeParameter('reportId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/${reportId}`,
			});
			return wrapResponse(data, simplify);
		}
		case 'fql': {
			const fqlBody = parseJsonParameter(this, 'fqlBody', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/fql`,
				body: fqlBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'getByPeriod': {
			const periodQuery = parseJsonParameter(this, 'periodQueryJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/by-period`,
				body: periodQuery,
			});
			return wrapResponse(data, simplify);
		}
		case 'checkPublishedExists': {
			const query = parseJsonParameter(this, 'checkPublishedQuery', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				path: `${base}/check-published-exists`,
				qs: query,
			});
			return wrapResponse(data, simplify);
		}
		case 'submitForReview': {
			const reportId = this.getNodeParameter('reportId', itemIndex) as string;
			const submitBody = parseJsonParameter(this, 'submitBodyJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/${reportId}/submit-for-review`,
				body: submitBody,
			});
			return wrapResponse(data, simplify);
		}
		case 'approve': {
			const reportId = this.getNodeParameter('reportId', itemIndex) as string;
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/${reportId}/approve`,
				body: {},
			});
			return wrapResponse(data, simplify);
		}
		case 'reject': {
			const reportId = this.getNodeParameter('reportId', itemIndex) as string;
			const rejectBody = parseJsonParameter(this, 'rejectBodyJson', itemIndex);
			const data = await teseApiRequest.call(this, credentials, {
				method: 'POST',
				path: `${base}/${reportId}/reject`,
				body: rejectBody,
			});
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unsupported report operation: ${operation}`, {
				itemIndex,
			});
	}
}

export async function routeTeseOperation(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	itemIndex: number,
): Promise<IDataObject> {
	const resource = this.getNodeParameter('resource', itemIndex) as string;
	const operation = this.getNodeParameter('operation', itemIndex) as string;
	const simplify = this.getNodeParameter('simplifyOutput', itemIndex, true) as boolean;

	switch (resource) {
		case 'facility':
			return executeFacility.call(this, credentials, operation, itemIndex, simplify);
		case 'activity':
			return executeActivity.call(this, credentials, operation, itemIndex, simplify);
		case 'metricCatalog':
			return executeMetricCatalog.call(this, credentials, operation, itemIndex, simplify);
		case 'esgData':
			return executeEsgData.call(this, credentials, operation, itemIndex, simplify);
		case 'framework':
			return executeFramework.call(this, credentials, operation, itemIndex, simplify);
		case 'auditRequest':
			return executeAuditRequest.call(this, credentials, operation, itemIndex, simplify);
		case 'report':
			return executeReport.call(this, credentials, operation, itemIndex, simplify);
		default:
			throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
				itemIndex,
			});
	}
}

export async function executeTeseRouter(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];
	const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {
			const responseData = await routeTeseOperation.call(this, credentials, itemIndex);
			returnData.push({
				json: responseData,
				pairedItem: { item: itemIndex },
			});
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: (error as Error).message },
					pairedItem: { item: itemIndex },
				});
				continue;
			}
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}
	}

	return [returnData];
}

export function extractListItems(data: unknown): IDataObject[] {
	if (Array.isArray(data)) return data as IDataObject[];
	if (typeof data === 'object' && data !== null) {
		const obj = data as IDataObject;
		if (Array.isArray(obj.data)) return obj.data as IDataObject[];
		if (Array.isArray(obj.items)) return obj.items as IDataObject[];
	}
	return [];
}

export function toNodeOptions(
	items: IDataObject[],
	idKey: string,
	labelKeys: string[],
): Array<{ name: string; value: string }> {
	return items
		.map((item) => {
			const value = String(item[idKey] ?? item._id ?? item.id ?? '');
			if (!value) return null;
			const label =
				labelKeys.map((key) => item[key]).find((part) => part !== undefined && part !== '') ??
				value;
			return { name: String(label), value };
		})
		.filter((option): option is { name: string; value: string } => option !== null);
}
