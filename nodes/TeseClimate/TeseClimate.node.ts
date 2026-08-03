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

const BASE = '/api/v3/external/climate';

async function executeOperation(
	execute: IExecuteFunctions,
	credentials: TeseApiCredentials,
	operation: string,
	itemIndex: number,
	simplify: boolean,
): Promise<IDataObject> {
	switch (operation) {
		case 'startPrediction': {
			const locationId = execute.getNodeParameter('locationId', itemIndex) as string;
			const latitude = execute.getNodeParameter('latitude', itemIndex) as number;
			const longitude = execute.getNodeParameter('longitude', itemIndex) as number;
			const futureYear = execute.getNodeParameter('futureYear', itemIndex, 2050) as number;
			const baselineYears = parseJsonParameter(execute, 'baselineYearsJson', itemIndex);
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/predict`,
					body: {
						location_id: locationId,
						latitude,
						longitude,
						future_year: futureYear,
						baseline_years: baselineYears,
					},
				},
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'getJobStatus': {
			const jobId = execute.getNodeParameter('jobId', itemIndex) as string;
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{ path: `${BASE}/predict/${encodeURIComponent(jobId)}/status` },
				itemIndex,
			);
			return wrapResponse(data, simplify);
		}
		case 'computeClimateImpact': {
			const impact = parseJsonParameter(execute, 'climateImpactJson', itemIndex);
			const data = await teseApiRequest.call(
				execute,
				credentials,
				{
					method: 'POST',
					path: `${BASE}/climate-impact`,
					body: impact,
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

export class TeseClimate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io Climate',
		name: 'teseClimate',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Run climate risk predictions and tourism climate-impact analysis',
		defaults: {
			name: 'tese.io Climate',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'teseApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Compute Climate Impact',
						value: 'computeClimateImpact',
						action: 'Compute climate impact for a polygon',
					},
					{
						name: 'Get Job Status',
						value: 'getJobStatus',
						action: 'Get climate prediction job status',
					},
					{
						name: 'Start Prediction',
						value: 'startPrediction',
						action: 'Start a climate risk prediction job',
					},
				],
				default: 'startPrediction',
			},
			{
				displayName: 'Location ID',
				name: 'locationId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { operation: ['startPrediction'] } },
			},
			{
				displayName: 'Latitude',
				name: 'latitude',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { operation: ['startPrediction'] } },
			},
			{
				displayName: 'Longitude',
				name: 'longitude',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { operation: ['startPrediction'] } },
			},
			{
				displayName: 'Future Year',
				name: 'futureYear',
				type: 'number',
				default: 2050,
				displayOptions: { show: { operation: ['startPrediction'] } },
			},
			{
				displayName: 'Baseline Years (JSON)',
				name: 'baselineYearsJson',
				type: 'json',
				default: '{"start_year":1991,"end_year":2020}',
				required: true,
				displayOptions: { show: { operation: ['startPrediction'] } },
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { operation: ['getJobStatus'] } },
			},
			{
				displayName: 'Climate Impact (JSON)',
				name: 'climateImpactJson',
				type: 'json',
				default: '{}',
				required: true,
				description: 'Location_id, polygon_id, selected_activity_tags[], future_year',
				displayOptions: { show: { operation: ['computeClimateImpact'] } },
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
