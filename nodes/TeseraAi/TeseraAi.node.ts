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

const BASE = '/api/v3/external/ai';

function buildExtraData(execute: IExecuteFunctions, itemIndex: number): IDataObject | null {
	const extraData = parseJsonParameter(execute, 'extraDataJson', itemIndex);
	const portfolioGroupId = execute.getNodeParameter('portfolioGroupId', itemIndex, '') as string;
	const facilityId = execute.getNodeParameter('facilityId', itemIndex, '') as string;
	const reportingCycleId = execute.getNodeParameter('reportingCycleId', itemIndex, '') as string;

	const merged: IDataObject = { ...extraData };
	if (portfolioGroupId) merged.portfolio_group_id = portfolioGroupId;
	if (facilityId) merged.facility_id = facilityId;
	if (reportingCycleId) merged.reporting_cycle_id = reportingCycleId;

	return Object.keys(merged).length > 0 ? merged : null;
}

async function executeOperation(
	execute: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	switch (operation) {
		case 'query': {
			const query = execute.getNodeParameter('query', itemIndex) as string;
			const sessionId = execute.getNodeParameter('sessionId', itemIndex, '') as string;
			const chatHistory = parseJsonParameter(execute, 'chatHistoryJson', itemIndex);
			const extraData = buildExtraData(execute, itemIndex);

			const body: IDataObject = { query };
			if (sessionId) body.session_id = sessionId;
			if (extraData) body.extra_data = extraData;
			if (Array.isArray(chatHistory.messages)) {
				body.chat_history = chatHistory.messages;
			} else if (Array.isArray(chatHistory)) {
				body.chat_history = chatHistory;
			}

			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/query`,
					body,
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'createChat': {
			const projectId = execute.getNodeParameter('projectId', itemIndex, '') as string;
			const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
			const body: IDataObject = {};
			if (projectId) body.project_id = projectId;
			if (userId) body.user_id = userId;

			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/chat/new`,
					body,
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'sendMessage': {
			const sessionId = execute.getNodeParameter('sessionId', itemIndex) as string;
			const query = execute.getNodeParameter('query', itemIndex) as string;
			const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
			const extraData = buildExtraData(execute, itemIndex);

			const body: IDataObject = { query };
			if (extraData) body.extra_data = extraData;
			if (userId) body.user_id = userId;

			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/chat/${encodeURIComponent(sessionId)}/message`,
					body,
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'getHistory': {
			const sessionId = execute.getNodeParameter('sessionId', itemIndex) as string;
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					path: `${BASE}/chat/${encodeURIComponent(sessionId)}/history`,
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'formatActionResult': {
			const query = execute.getNodeParameter('query', itemIndex) as string;
			const toolId = execute.getNodeParameter('toolId', itemIndex) as string;
			const rawData = parseJsonParameter(execute, 'rawDataJson', itemIndex);

			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/format-action-result`,
					body: {
						query,
						tool_id: toolId,
						raw_data: rawData,
					},
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

export class TeseraAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tesera AI',
		name: 'teseraAi',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Query Tesera AI — TESE portfolio RAG, chat sessions, and action result formatting',
		defaults: {
			name: 'Tesera AI',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'teseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat: Create Session',
						value: 'createChat',
						description: 'Start a multi-turn Tesera chat session',
						action: 'Create a chat session',
					},
					{
						name: 'Chat: Get History',
						value: 'getHistory',
						description: 'Retrieve messages from a chat session',
						action: 'Get chat history',
					},
					{
						name: 'Chat: Send Message',
						value: 'sendMessage',
						description: 'Send a message in an existing chat session',
						action: 'Send a chat message',
					},
					{
						name: 'Format Action Result',
						value: 'formatActionResult',
						description: 'Turn raw API JSON into a natural language answer',
						action: 'Format an action result',
					},
					{
						name: 'Query',
						value: 'query',
						description: 'One-shot AI query (RAG, portfolio analysis, data questions)',
						action: 'Run an AI query',
					},
				],
				default: 'query',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['query', 'sendMessage', 'formatActionResult'],
					},
				},
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				description: 'Chat session ID. For Query, leave empty to auto-generate.',
				displayOptions: {
					show: {
						operation: ['query', 'sendMessage', 'getHistory'],
					},
				},
			},
			{
				displayName: 'Tool ID',
				name: 'toolId',
				type: 'string',
				default: '',
				required: true,
				description: 'Action tool identifier from a prior action_plan response',
				displayOptions: {
					show: {
						operation: ['formatActionResult'],
					},
				},
			},
			{
				displayName: 'Raw Data (JSON)',
				name: 'rawDataJson',
				type: 'json',
				default: '{}',
				required: true,
				description: 'Raw JSON returned from a tese.io action or API call',
				displayOptions: {
					show: {
						operation: ['formatActionResult'],
					},
				},
			},
			{
				displayName: 'Chat History (JSON)',
				name: 'chatHistoryJson',
				type: 'json',
				default: '[]',
				description: 'Optional prior turns as [{ "role": "user"|"assistant", "content": "..." }]',
				displayOptions: {
					show: {
						operation: ['query'],
					},
				},
			},
			{
				displayName: 'Portfolio Group ID',
				name: 'portfolioGroupId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['query', 'sendMessage'],
					},
				},
			},
			{
				displayName: 'Facility ID',
				name: 'facilityId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['query', 'sendMessage'],
					},
				},
			},
			{
				displayName: 'Reporting Cycle ID',
				name: 'reportingCycleId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['query', 'sendMessage'],
					},
				},
			},
			{
				displayName: 'Extra Data (JSON)',
				name: 'extraDataJson',
				type: 'json',
				default: '{}',
				description: 'Additional context passed to the AI orchestrator',
				displayOptions: {
					show: {
						operation: ['query', 'sendMessage'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['createChat'],
					},
				},
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Acting TESE user ID for chat ownership (optional for API keys)',
				displayOptions: {
					show: {
						operation: ['createChat', 'sendMessage'],
					},
				},
			},
			{
				displayName: 'Simplify Output',
				name: 'simplify',
				type: 'boolean',
				default: false,
				description: 'Whether to simplify the API response for downstream nodes',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
		const operation = this.getNodeParameter('operation', 0) as string;
		const simplify = this.getNodeParameter('simplify', 0, false) as boolean;
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const json = await executeOperation(this, credentials, operation, itemIndex, simplify);
			returnData.push({ json, pairedItem: { item: itemIndex } });
		}

		return [returnData];
	}
}
