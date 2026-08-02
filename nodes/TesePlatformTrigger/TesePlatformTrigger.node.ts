import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { getPlatformFixture } from '../shared/platformFixtures';
import {
	PLATFORM_EVENT_MAP,
	shouldAcceptPlatformPayload,
	type PlatformEventKey,
} from '../shared/platformEventMap';
import {
	deletePlatformSubscription,
	getStaticSubscriptionId,
	registerPlatformSubscription,
} from '../shared/platformSubscription';
import type { TeseApiCredentials } from '../shared/teseApiRequest';

export class TesePlatformTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'tese.io Platform Trigger',
		name: 'tesePlatformTrigger',
		icon: { light: 'file:tese.svg', dark: 'file:tese.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventType"]}}',
		description:
			'Starts a workflow when TESE platform events occur (task/report status, approvals, devices)',
		defaults: {
			name: 'tese.io Platform Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'teseApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'tese-platform',
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
						name: 'Activity Status Changed',
						value: 'activityStatusChanged',
					},
					{
						name: 'Assessment Created',
						value: 'assessmentCreated',
					},
					{
						name: 'Assessment Published',
						value: 'assessmentPublished',
					},
					{
						name: 'Device Created',
						value: 'deviceCreated',
					},
					{
						name: 'Entity Status Changed',
						value: 'entityStatusChanged',
					},
					{
						name: 'Report Status Changed',
						value: 'reportStatusChanged',
					},
					{
						name: 'Task Approval Decided',
						value: 'taskApprovalDecided',
					},
					{
						name: 'Task Status Changed',
						value: 'taskStatusChanged',
					},
				],
				default: 'taskStatusChanged',
				required: true,
				description: 'Which TESE platform event activates this workflow',
			},
			{
				displayName: 'Auto-Register Webhook',
				name: 'autoRegister',
				type: 'boolean',
				default: true,
				description:
					'Whether to register this n8n webhook URL with TESE when the workflow is activated',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', true) as boolean;
				if (!autoRegister) {
					const webhookUrl = this.getNodeWebhookUrl('default');
					return typeof webhookUrl === 'string' && webhookUrl.length > 0;
				}

				const staticData = this.getWorkflowStaticData('node') as IDataObject;
				return Boolean(getStaticSubscriptionId(staticData));
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', true) as boolean;
				if (!autoRegister) return true;

				const eventType = this.getNodeParameter('eventType') as PlatformEventKey;
				const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
				const staticData = this.getWorkflowStaticData('node') as IDataObject;

				const subscriptionId = await registerPlatformSubscription(this, credentials, eventType);
				staticData.subscriptionId = subscriptionId;
				staticData.eventType = eventType;
				staticData.subscribeEvent = PLATFORM_EVENT_MAP[eventType].subscribeEvent;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', true) as boolean;
				if (!autoRegister) return true;

				const staticData = this.getWorkflowStaticData('node') as IDataObject;
				const subscriptionId = getStaticSubscriptionId(staticData);
				if (!subscriptionId) return true;

				try {
					const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;
					await deletePlatformSubscription(this, credentials, subscriptionId);
				} catch {
					// Non-fatal on deactivate — subscription may already be removed
				}

				delete staticData.subscriptionId;
				delete staticData.eventType;
				delete staticData.subscribeEvent;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const eventType = this.getNodeParameter('eventType') as PlatformEventKey;

		if (this.getMode() === 'manual') {
			return {
				workflowData: [[{ json: getPlatformFixture(eventType) }]],
			};
		}

		const bodyData = this.getBodyData() as IDataObject;
		const payload = (Array.isArray(bodyData) ? bodyData[0] : bodyData) as IDataObject;

		if (!shouldAcceptPlatformPayload(eventType, payload)) {
			return {
				webhookResponse: {
					status: 200,
					body: { accepted: false, reason: 'event filtered' },
				},
			};
		}

		const subscribeEvent = PLATFORM_EVENT_MAP[eventType].subscribeEvent;
		if (payload.event && payload.event !== subscribeEvent) {
			return {
				webhookResponse: {
					status: 200,
					body: { accepted: false, reason: 'unexpected event type' },
				},
			};
		}

		return {
			workflowData: [[{ json: payload }]],
		};
	}
}
