import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import {
	buildFinalizeBody,
	buildFinalizeHeaders,
	extractFinalizeToken,
	resolveFinalizeUrl,
} from '../shared/finalizeHelpers';
import type { TeseApiCredentials } from '../shared/teseApiRequest';

function parseJsonField(
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

function resolveFinalizeKind(
	operation: string,
	item: IDataObject,
): 'activity' | 'aggregation' | 'formula' {
	if (operation === 'finalizeAggregation') return 'aggregation';

	const question = item.Question as IDataObject | undefined;
	if (question?.formula_source === 'n8n' || question?.kind === 'activity_input') {
		return 'formula';
	}

	return 'activity';
}

function buildResultOverrides(executeFunctions: IExecuteFunctions, itemIndex: number): IDataObject {
	const overrides: IDataObject = {};
	const value = executeFunctions.getNodeParameter('value', itemIndex, '') as string;
	const unitCode = executeFunctions.getNodeParameter('unitCode', itemIndex, '') as string;
	const answerBankId = executeFunctions.getNodeParameter('answerBankId', itemIndex, '') as string;
	const status = executeFunctions.getNodeParameter('status', itemIndex, 'completed') as string;
	const metadata = parseJsonField(executeFunctions, 'metadataJson', itemIndex);
	const additionalFields = parseJsonField(executeFunctions, 'additionalFieldsJson', itemIndex);

	if (value !== '') {
		const numeric = Number(value);
		overrides.value = Number.isNaN(numeric) ? value : numeric;
	}
	if (unitCode) overrides.unit_code = unitCode;
	if (answerBankId) overrides.answer_bank_id = answerBankId;
	if (status) overrides.status = status;
	if (Object.keys(metadata).length > 0) overrides.metadata = metadata;

	return { ...overrides, ...additionalFields };
}

function buildLegacyCallbackBody(item: IDataObject, overrides: IDataObject): IDataObject {
	const answer = item.answer as IDataObject | undefined;
	const question = item.Question as IDataObject | undefined;

	return {
		answer_id: overrides.answer_id ?? answer?.answer_id,
		question_id: overrides.question_id ?? question?.question_id,
		value: overrides.value,
		unit_code: overrides.unit_code,
		status: overrides.status ?? 'completed',
		metadata: overrides.metadata,
		answer_bank_id: overrides.answer_bank_id,
	};
}

async function postLegacyCallback(
	this: IExecuteFunctions,
	item: IDataObject,
	resultOverrides: IDataObject,
): Promise<IDataObject> {
	const callbackUrl = item.callback_url as string | undefined;
	if (!callbackUrl) {
		throw new NodeOperationError(this.getNode(), 'callback_url is missing from the input item');
	}

	const body = buildLegacyCallbackBody(item, resultOverrides);
	const response = await this.helpers.httpRequest({
		method: 'POST',
		url: callbackUrl,
		body,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		json: true,
	});

	return typeof response === 'object' && response !== null
		? (response as IDataObject)
		: { response };
}

async function postFinalizeRequest(
	this: IExecuteFunctions,
	item: IDataObject,
	operation: string,
	resultOverrides: IDataObject,
	credentials: TeseApiCredentials | null,
): Promise<IDataObject> {
	const kind = resolveFinalizeKind(operation, item);
	const baseUrl = credentials?.baseUrl ?? 'https://api.tese.io';
	const finalizeUrl = resolveFinalizeUrl(item, baseUrl);
	const finalizeToken = extractFinalizeToken(item);
	const headers = buildFinalizeHeaders({
		finalizeToken,
		apiKey: credentials?.apiKey,
		workflowId: this.getWorkflow()?.id,
		runId: this.getExecutionId(),
	});
	const body = buildFinalizeBody(item, kind, resultOverrides);

	const response = await this.helpers.httpRequest({
		method: 'POST',
		url: finalizeUrl,
		body,
		headers: headers as IDataObject,
		json: true,
	});

	return typeof response === 'object' && response !== null
		? (response as IDataObject)
		: { response };
}

export class TeseFinalize implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io Finalize',
		name: 'teseFinalize',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Finalize tese.io n8n workflow results via the unified finalize endpoint or legacy callback URL',
		defaults: {
			name: 'tese.io Finalize',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'teseApi',
				required: false,
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
						name: 'Finalize Activity',
						value: 'finalizeActivity',
						description: 'POST kind=activity or formula to the unified finalize endpoint',
						action: 'Finalize an activity result',
					},
					{
						name: 'Finalize Aggregation',
						value: 'finalizeAggregation',
						description: 'POST kind=aggregation to the unified finalize endpoint',
						action: 'Finalize an aggregation result',
					},
					{
						name: 'Legacy Callback',
						value: 'legacyCallback',
						description: 'POST to callback_url from the trigger payload (pre-unified finalize)',
						action: 'Send a legacy callback',
					},
				],
				default: 'finalizeActivity',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				description: 'Computed numeric or string result to send back to TESE',
			},
			{
				displayName: 'Unit Code',
				name: 'unitCode',
				type: 'string',
				default: '',
				description: 'Optional unit code for the result (e.g. kg, liters)',
			},
			{
				displayName: 'Answer Bank ID',
				name: 'answerBankId',
				type: 'string',
				default: '',
				description: 'Optional answer bank ID for aggregation results',
				displayOptions: {
					show: {
						operation: ['finalizeAggregation', 'legacyCallback'],
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Completed', value: 'completed' },
					{ name: 'Failed', value: 'failed' },
				],
				default: 'completed',
			},
			{
				displayName: 'Metadata',
				name: 'metadataJson',
				type: 'json',
				default: '{}',
				description: 'Optional metadata object sent with the finalize payload',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFieldsJson',
				type: 'json',
				default: '{}',
				description: 'Extra fields merged into the finalize or callback body',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const item = { ...items[itemIndex].json } as IDataObject;
				const resultOverrides = buildResultOverrides(this, itemIndex);

				let responseData: IDataObject;
				if (operation === 'legacyCallback') {
					responseData = await postLegacyCallback.call(this, item, resultOverrides);
				} else {
					const credentials = (await this.getCredentials('teseApi').catch(
						() => null,
					)) as TeseApiCredentials | null;
					responseData = await postFinalizeRequest.call(
						this,
						item,
						operation,
						resultOverrides,
						credentials,
					);
				}

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
}
