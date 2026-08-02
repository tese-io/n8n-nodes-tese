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

const DOCUMENT_TYPES = [
	'delivery_note',
	'electricity_bill',
	'flight_ticket',
	'fuel_receipt',
	'gas_bill',
	'heat_bill',
	'hotel_invoice',
	'meter_reading',
	'mileage_log',
	'purchase_invoice',
	'rail_ticket',
	'receipt',
	'recycling_invoice',
	'unknown',
	'waste_invoice',
	'water_bill',
] as const;

async function executeOperation(
	execute: IExecuteFunctions,
	credentials: TeseApiCredentials,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	const imageSource = execute.getNodeParameter('imageSource', itemIndex) as string;
	const mimeType = execute.getNodeParameter('mimeType', itemIndex, 'image/jpeg') as string;
	const documentType = execute.getNodeParameter('documentType', itemIndex, 'unknown') as string;
	const hint = execute.getNodeParameter('hint', itemIndex, '') as string;
	const userId = execute.getNodeParameter('userId', itemIndex, '') as string;
	const evidence = parseJsonParameter(execute, 'evidenceJson', itemIndex);

	const body: IDataObject = {
		mime_type: mimeType,
		document_type: documentType,
		evidence: Object.keys(evidence).length > 0 ? evidence : { capture_method: 'upload' },
	};

	if (imageSource === 'url') {
		body.image_url = execute.getNodeParameter('imageUrl', itemIndex) as string;
	} else {
		body.image_base64 = execute.getNodeParameter('imageBase64', itemIndex) as string;
	}

	if (hint) body.hint = hint;
	if (userId) body.user_id = userId;

	const data = await teseApiRequest.call(
		execute,
		credentials,
		{
			method: 'POST',
			path: `${BASE}/ocr/process`,
			body,
		},
		itemIndex,
	);
	return wrapResponse(data, simplify);
}

export class TeseOcr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io OCR',
		name: 'teseOcr',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Extract structured field values from bills, receipts, and meter photos',
		defaults: {
			name: 'tese.io OCR',
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
						name: 'Process Document',
						value: 'processDocument',
						description: 'Run OCR on an image or PDF and return canonical extraction fields',
						action: 'Process a document',
					},
				],
				default: 'processDocument',
			},
			{
				displayName: 'Image Source',
				name: 'imageSource',
				type: 'options',
				options: [
					{ name: 'Base64', value: 'base64' },
					{ name: 'URL', value: 'url' },
				],
				default: 'base64',
			},
			{
				displayName: 'Image (Base64)',
				name: 'imageBase64',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: {
					show: { imageSource: ['base64'] },
				},
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'Pre-signed URL the TESE OCR service can fetch',
				displayOptions: {
					show: { imageSource: ['url'] },
				},
			},
			{
				displayName: 'MIME Type',
				name: 'mimeType',
				type: 'options',
				options: [
					{ name: 'Image HEIC', value: 'image/heic' },
					{ name: 'Image JPEG', value: 'image/jpeg' },
					{ name: 'Image PNG', value: 'image/png' },
					{ name: 'Image TIFF', value: 'image/tiff' },
					{ name: 'PDF', value: 'application/pdf' },
				],
				default: 'image/jpeg',
			},
			{
				displayName: 'Document Type',
				name: 'documentType',
				type: 'options',
				options: DOCUMENT_TYPES.map((value) => ({
					name: value
						.split('_')
						.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
						.join(' '),
					value,
				})),
				default: 'unknown',
			},
			{
				displayName: 'Hint',
				name: 'hint',
				type: 'string',
				default: '',
				description: 'Optional free-text hint (e.g. "electricity bill from Octopus")',
			},
			{
				displayName: 'Evidence (JSON)',
				name: 'evidenceJson',
				type: 'json',
				default: '{}',
				description: 'Optional chain-of-custody metadata (sha256, captured_at, device_id, gps)',
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
			if (operation !== 'processDocument') {
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
