import type { IDataObject } from 'n8n-workflow';

export type PlatformEventKey =
	| 'entityStatusChanged'
	| 'taskStatusChanged'
	| 'reportStatusChanged'
	| 'activityStatusChanged'
	| 'taskApprovalDecided'
	| 'assessmentPublished'
	| 'assessmentCreated'
	| 'deviceCreated';

export interface PlatformEventConfig {
	subscribeEvent: string;
	entityType?: string;
}

export const PLATFORM_EVENT_MAP: Record<PlatformEventKey, PlatformEventConfig> = {
	entityStatusChanged: { subscribeEvent: 'ENTITY_STATUS_CHANGED' },
	taskStatusChanged: { subscribeEvent: 'ENTITY_STATUS_CHANGED', entityType: 'task' },
	reportStatusChanged: { subscribeEvent: 'ENTITY_STATUS_CHANGED', entityType: 'report' },
	activityStatusChanged: { subscribeEvent: 'ENTITY_STATUS_CHANGED', entityType: 'activity' },
	taskApprovalDecided: { subscribeEvent: 'TASK_APPROVAL_DECIDED' },
	assessmentPublished: { subscribeEvent: 'ASSESSMENT_PUBLISHED' },
	assessmentCreated: { subscribeEvent: 'ASSESSMENT_CREATED' },
	deviceCreated: { subscribeEvent: 'MODEL_DEVICE_CREATE' },
};

export function shouldAcceptPlatformPayload(
	eventKey: PlatformEventKey,
	payload: IDataObject,
): boolean {
	const config = PLATFORM_EVENT_MAP[eventKey];
	const data = (payload.data as IDataObject) || {};

	if (config.entityType && data.entityType !== config.entityType) {
		return false;
	}

	return true;
}

export function unwrapApiData(response: unknown): IDataObject {
	if (typeof response !== 'object' || response === null) return {};
	const envelope = response as IDataObject;
	if (envelope.data && typeof envelope.data === 'object') {
		return envelope.data as IDataObject;
	}
	return envelope;
}
