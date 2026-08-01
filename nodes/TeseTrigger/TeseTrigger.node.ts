import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { getTriggerFixture } from '../shared/testFixtures';

export class TeseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tese Trigger',
		name: 'teseTrigger',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventType"]}}',
		description: 'Starts a workflow when TESE sends an activity formula or aggregation webhook',
		defaults: {
			name: 'Tese Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'tese',
				isFullPath: false,
			},
		],
		properties: [
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [
					{
						name: 'Activity Formula',
						value: 'activityFormula',
						description: 'Triggered when an activity-input question uses an n8n formula workflow',
					},
					{
						name: 'Activity Aggregation',
						value: 'activityAggregation',
						description:
							'Triggered when an activity-aggregate question uses an n8n aggregation workflow',
					},
				],
				default: 'activityFormula',
				required: true,
				description: 'Which TESE webhook payload shape this trigger expects',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				return typeof webhookUrl === 'string' && webhookUrl.length > 0;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const eventType = this.getNodeParameter('eventType') as string;

		if (this.getMode() === 'manual') {
			const fixture = getTriggerFixture(eventType);
			return {
				workflowData: [[{ json: fixture }]],
			};
		}

		const bodyData = this.getBodyData();
		const items: IDataObject[] = Array.isArray(bodyData)
			? (bodyData as IDataObject[])
			: [bodyData as IDataObject];

		return {
			workflowData: [items.map((item) => ({ json: item }))],
		};
	}
}
