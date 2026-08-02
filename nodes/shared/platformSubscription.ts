import type { IDataObject, IHookFunctions } from 'n8n-workflow';
import type { TeseApiCredentials } from './teseApiRequest';
import { PLATFORM_EVENT_MAP, unwrapApiData, type PlatformEventKey } from './platformEventMap';

function trimBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}

export function resolveSubscribeEvent(eventKey: PlatformEventKey): string {
	return PLATFORM_EVENT_MAP[eventKey].subscribeEvent;
}

export async function registerPlatformSubscription(
	ctx: IHookFunctions,
	credentials: TeseApiCredentials,
	eventKey: PlatformEventKey,
): Promise<string> {
	const webhookUrl = ctx.getNodeWebhookUrl('default');
	if (!webhookUrl) {
		throw new Error('Webhook URL is not available for this trigger');
	}

	const subscribeEvent = resolveSubscribeEvent(eventKey);
	const response = await ctx.helpers.httpRequest({
		method: 'POST',
		url: `${trimBaseUrl(credentials.baseUrl)}/api/v3/external/webhooks/subscriptions`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: {
			event: subscribeEvent,
			callbackUrl: webhookUrl,
		},
		json: true,
	});

	const data = unwrapApiData(response);
	const subscriptionId = data._id;
	if (!subscriptionId) {
		throw new Error('TESE did not return a webhook subscription id');
	}

	return String(subscriptionId);
}

export async function deletePlatformSubscription(
	ctx: IHookFunctions,
	credentials: TeseApiCredentials,
	subscriptionId: string,
): Promise<void> {
	await ctx.helpers.httpRequest({
		method: 'DELETE',
		url: `${trimBaseUrl(credentials.baseUrl)}/api/v3/external/webhooks/subscriptions/${encodeURIComponent(subscriptionId)}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			Accept: 'application/json',
		},
		json: true,
	});
}

export function getStaticSubscriptionId(staticData: IDataObject): string | undefined {
	const id = staticData.subscriptionId;
	return typeof id === 'string' && id.length > 0 ? id : undefined;
}
