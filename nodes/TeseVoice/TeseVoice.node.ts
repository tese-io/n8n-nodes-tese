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

const BASE = '/api/v3/external/capture';

async function executeOperation(
	execute: IExecuteFunctions,
	credentials: TeseApiCredentials,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const inputMode = execute.getNodeParameter('inputMode', itemIndex) as string;
	const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
	const context = parseJsonParameter(execute, 'contextJson', itemIndex);

	const body: IDataObject = {
		context: Object.keys(context).length > 0 ? context : {},
	};

	if (inputMode === 'transcript') {
		body.transcript = execute.getNodeParameter('transcript', itemIndex) as string;
	} else {
		body.audio_base64 = execute.getNodeParameter('audioBase64', itemIndex) as string;
		body.audio_mime = execute.getNodeParameter('audioMime', itemIndex, 'audio/wav') as string;
	}

	if (userId) body.user_id = userId;

	const data = await teseApiRequest.call(
		execute,
		credentials,
		{
			method: 'POST',
			path: `${BASE}/voice/extract`,
			body,
		},
		itemIndex,
	);
	return wrapResponse(data, simplify);
}

export class TeseVoice implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io Voice Entry',
		name: 'teseVoice',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Transcribe spoken field readings and extract structured ESG form values',
		defaults: {
			name: 'tese.io Voice Entry',
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
						name: 'Extract Fields',
						value: 'extractFields',
						description: 'Transcribe audio (or accept a transcript) and map values to form fields',
						action: 'Extract field values from voice',
					},
				],
				default: 'extractFields',
			},
			{
				displayName: 'Input Mode',
				name: 'inputMode',
				type: 'options',
				options: [
					{ name: 'Audio (Base64)', value: 'audio' },
					{ name: 'Transcript', value: 'transcript' },
				],
				default: 'audio',
			},
			{
				displayName: 'Audio (Base64)',
				name: 'audioBase64',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: {
					show: { inputMode: ['audio'] },
				},
			},
			{
				displayName: 'Audio MIME Type',
				name: 'audioMime',
				type: 'options',
				options: [
					{ name: 'WAV', value: 'audio/wav' },
					{ name: 'MP4 / M4A', value: 'audio/mp4' },
					{ name: 'OGG', value: 'audio/ogg' },
					{ name: 'WebM', value: 'audio/webm' },
				],
				default: 'audio/wav',
				displayOptions: {
					show: { inputMode: ['audio'] },
				},
			},
			{
				displayName: 'Transcript',
				name: 'transcript',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'Pre-computed transcript when audio was transcribed upstream',
				displayOptions: {
					show: { inputMode: ['transcript'] },
				},
			},
			{
				displayName: 'Context (JSON)',
				name: 'contextJson',
				type: 'json',
				default: '{}',
				description:
					'Question and field schema: fields[], facility_id, reporting_cycle_id, question_text, metric_ref',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Optional TESE user ID for audit attribution on external API keys',
			},
			{
				displayName: 'Simplify Output',
				name: 'simplify',
				type: 'boolean',
				default: true,
				description: 'Whether to unwrap the TESE API success envelope',
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
			if (operation !== 'extractFields') {
				throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
					itemIndex,
				});
			}
			const json = await executeOperation(this, credentials, itemIndex, simplify);
			returnData.push({ json, pairedItem: { item: itemIndex } });
		}

		return [returnData];
	}
}
