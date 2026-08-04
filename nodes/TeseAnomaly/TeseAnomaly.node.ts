import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { parseJsonParameter, wrapResponse } from '../Tese/actions/helpers';
import { teseApiRequest, type TeseApiCredentials } from '../shared/teseApiRequest';

const BASE = '/api/v3/external/anomaly';

async function executeOperation(
	execute: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	switch (operation) {
		case 'getMany': {
			const reportId = execute.getNodeParameter('reportId', itemIndex, '') as string;
			const financialYearId = execute.getNodeParameter('financialYearId', itemIndex, '') as string;
			const status = execute.getNodeParameter('status', itemIndex, 'active') as string;
			const limit = execute.getNodeParameter('limit', itemIndex, 50) as number;
			const cursor = execute.getNodeParameter('cursor', itemIndex, '') as string;
			const qs: IDataObject = { status, limit };
			if (reportId) qs.report_id = reportId;
			if (financialYearId) qs.financial_year_id = financialYearId;
			if (cursor) qs.cursor = cursor;
			const data = await teseApiRequest.call(execute, credentials, { path: BASE, qs }, itemIndex);
			return wrapResponse(data, simplify);
		}
		case 'override': {
			const answerBankId = execute.getNodeParameter('answerBankId', itemIndex) as string;
			const overrideStatus = execute.getNodeParameter('overrideStatus', itemIndex) as string;
			const reason = execute.getNodeParameter('reason', itemIndex, '') as string;
			const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
			const body: IDataObject = { status: overrideStatus };
			if (reason) body.reason = reason;
			if (userId) body.user_id = userId;
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'PATCH',
					path: `${BASE}/${encodeURIComponent(answerBankId)}/override`,
					body,
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'processByIds': {
			const recordIds = parseJsonParameter(execute, 'recordIdsJson', itemIndex);
			const ids = Array.isArray(recordIds)
				? recordIds
				: Array.isArray(recordIds.record_ids)
					? recordIds.record_ids
					: null;
			if (!ids || ids.length === 0) {
				throw new NodeOperationError(
					execute.getNode(),
					'Record IDs must be a non-empty JSON array (or { "record_ids": [...] })',
					{ itemIndex },
				);
			}
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/process-by-ids`,
					body: { record_ids: ids },
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'processRandom': {
			const limit = execute.getNodeParameter('batchLimit', itemIndex, 10) as number;
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/process-random`,
					body: { limit },
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'getWorkflowStatus': {
			const workflowId = execute.getNodeParameter('workflowId', itemIndex) as string;
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{ path: `${BASE}/workflows/${encodeURIComponent(workflowId)}/status` },
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'evaluatePermanence': {
			const signal = parseJsonParameter(execute, 'permanenceSignalJson', itemIndex);
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/permanence-signal`,
					body: signal,
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		default:
			throw new NodeOperationError(execute.getNode(), `Unsupported operation: ${operation}`, {
				itemIndex,
			});
	}
}

export class TeseAnomaly implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io Anomaly',
		name: 'teseAnomaly',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Detect, list, and manage ESG data anomalies and permanence signals',
		defaults: {
			name: 'tese.io Anomaly',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'teseApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Detection', value: 'detection' },
					{ name: 'Review', value: 'review' },
				],
				default: 'review',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['review'] },
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						action: 'List detected anomalies',
					},
					{
						name: 'Override',
						value: 'override',
						action: 'Override an anomaly on an answer',
					},
				],
				default: 'getMany',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['detection'] },
				},
				options: [
					{
						name: 'Evaluate Permanence Signal',
						value: 'evaluatePermanence',
						action: 'Evaluate a permanence signal',
					},
					{
						name: 'Get Workflow Status',
						value: 'getWorkflowStatus',
						action: 'Get anomaly batch workflow status',
					},
					{
						name: 'Process By IDs',
						value: 'processByIds',
						action: 'Run anomaly detection on answer bank record ids',
					},
					{
						name: 'Process Random',
						value: 'processRandom',
						action: 'Run anomaly detection on random answers',
					},
				],
				default: 'processByIds',
			},
			{
				displayName: 'Report ID',
				name: 'reportId',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['getMany'] } },
			},
			{
				displayName: 'Financial Year ID',
				name: 'financialYearId',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['getMany'] } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Acknowledged', value: 'acknowledged' },
					{ name: 'Active', value: 'active' },
					{ name: 'All', value: 'all' },
					{ name: 'Confirmed Not Anomaly', value: 'confirmed_not_anomaly' },
					{ name: 'Ignored', value: 'ignored' },
				],
				default: 'active',
				displayOptions: { show: { operation: ['getMany'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				description: 'Max number of results to return',
				default: 50,
				displayOptions: { show: { operation: ['getMany'] } },
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['getMany'] } },
			},
			{
				displayName: 'Answer Bank ID',
				name: 'answerBankId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { operation: ['override'] } },
			},
			{
				displayName: 'Override Status',
				name: 'overrideStatus',
				type: 'options',
				options: [
					{ name: 'Acknowledged', value: 'acknowledged' },
					{ name: 'Confirmed Not Anomaly', value: 'confirmed_not_anomaly' },
					{ name: 'Ignored', value: 'ignored' },
					{ name: 'None', value: 'none' },
				],
				default: 'acknowledged',
				displayOptions: { show: { operation: ['override'] } },
			},
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['override'], overrideStatus: ['ignored'] } },
			},
			{
				displayName: 'Record IDs (JSON)',
				name: 'recordIdsJson',
				type: 'json',
				default: '[]',
				required: true,
				description: 'Array of Answer Bank record IDs',
				displayOptions: { show: { operation: ['processByIds'] } },
			},
			{
				displayName: 'Batch Limit',
				name: 'batchLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 200,
				},
				description: 'Max number of random unprocessed records to process',
				default: 10,
				displayOptions: { show: { operation: ['processRandom'] } },
			},
			{
				displayName: 'Workflow ID',
				name: 'workflowId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { operation: ['getWorkflowStatus'] } },
			},
			{
				displayName: 'Permanence Signal (JSON)',
				name: 'permanenceSignalJson',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: { show: { operation: ['evaluatePermanence'] } },
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				default: '',
				description: 'Acting user ObjectId for audit attribution on overrides',
				displayOptions: { show: { operation: ['override'] } },
			},
			{
				displayName: 'Simplify Output',
				name: 'simplify',
				type: 'boolean',
				default: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
		const operation = this.getNodeParameter('operation', 0) as string;
		const simplify = this.getNodeParameter('simplify', 0, true) as boolean;
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const json = await executeOperation(this, credentials, operation, itemIndex, simplify);
			returnData.push({ json, pairedItem: { item: itemIndex } });
		}

		return [returnData];
	}
}
