import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { teseProperties } from './properties';
import { executeTeseRouter, extractListItems, toNodeOptions } from './executeRouter';
import { teseApiRequest, type TeseApiCredentials } from '../shared/teseApiRequest';

export class Tese implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io',
		name: 'tese',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the tese.io external API (facilities, ESG data, reports, and more)',
		defaults: {
			name: 'tese.io',
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
		properties: teseProperties,
	};

	methods = {
		loadOptions: {
			async getFacilities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
				const response = await teseApiRequest.call(this, credentials, {
					path: '/api/v3/external/facilities',
					qs: { limit: 500 },
				});
				const items = extractListItems(response);
				return toNodeOptions(items, '_id', ['name', 'facility_name', 'title']);
			},

			async getFrameworks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
				const response = await teseApiRequest.call(this, credentials, {
					path: '/api/v3/external/esg/framework',
				});
				const items = extractListItems(response);
				return toNodeOptions(items, '_id', ['name', 'title', 'framework_name']);
			},

			async getQuestionBank(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
				const response = await teseApiRequest.call(this, credentials, {
					path: '/api/v3/external/esg/question-bank/activity-inputs',
				});
				const items = extractListItems(response);
				return toNodeOptions(items, 'question_id', ['title', 'name', 'question_id']);
			},
		},
	};

	async execute(this: IExecuteFunctions) {
		return executeTeseRouter.call(this);
	}
}
