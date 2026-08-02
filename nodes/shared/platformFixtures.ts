import type { IDataObject } from 'n8n-workflow';
import type { PlatformEventKey } from './platformEventMap';

export const entityStatusChangedFixture: IDataObject = {
	event: 'ENTITY_STATUS_CHANGED',
	timestamp: '2026-01-15T10:00:00.000Z',
	tenant_id: 'tenant_preview',
	data: {
		entityType: 'task',
		entityId: 'task_preview_001',
		fromState: 'state_todo',
		toState: 'state_in_progress',
		tenantId: 'tenant_preview',
		updatedBy: 'user_preview',
	},
};

export const reportStatusChangedFixture: IDataObject = {
	event: 'ENTITY_STATUS_CHANGED',
	timestamp: '2026-01-15T10:00:00.000Z',
	tenant_id: 'tenant_preview',
	data: {
		entityType: 'report',
		entityId: 'report_preview_001',
		fromState: 'draft',
		toState: 'in_review',
		tenantId: 'tenant_preview',
		updatedBy: 'user_preview',
	},
};

export const taskApprovalDecidedFixture: IDataObject = {
	event: 'TASK_APPROVAL_DECIDED',
	timestamp: '2026-01-15T10:00:00.000Z',
	tenant_id: 'tenant_preview',
	data: {
		approval_request_id: 'approval_preview_001',
		entity_type: 'activity',
		entity_id: 'activity_preview_001',
		status: 'approved',
		decision: 'approved',
		reviewer_id: 'reviewer_preview',
	},
};

export const deviceCreatedFixture: IDataObject = {
	event: 'MODEL_DEVICE_CREATE',
	timestamp: '2026-01-15T10:00:00.000Z',
	tenant_id: 'tenant_preview',
	data: {
		_id: 'device_preview_001',
		device_id: 'DEV-001',
		device_title: 'Main Energy Meter',
		device_type: 'ENERGY_METER',
		facility_id: 'facility_preview',
		tenant_id: 'tenant_preview',
		status: 'active',
	},
};

export const assessmentPublishedFixture: IDataObject = {
	event: 'ASSESSMENT_PUBLISHED',
	timestamp: '2026-01-15T10:00:00.000Z',
	tenant_id: 'tenant_preview',
	data: {
		assessment_id: 'assessment_preview_001',
		title: 'FY2026 Materiality Assessment',
		status: 'published',
	},
};

const FIXTURES: Record<PlatformEventKey, IDataObject> = {
	entityStatusChanged: entityStatusChangedFixture,
	taskStatusChanged: entityStatusChangedFixture,
	reportStatusChanged: reportStatusChangedFixture,
	activityStatusChanged: {
		...entityStatusChangedFixture,
		data: {
			...(entityStatusChangedFixture.data as IDataObject),
			entityType: 'activity',
			entityId: 'activity_preview_001',
		},
	},
	taskApprovalDecided: taskApprovalDecidedFixture,
	assessmentPublished: assessmentPublishedFixture,
	assessmentCreated: {
		event: 'ASSESSMENT_CREATED',
		timestamp: '2026-01-15T10:00:00.000Z',
		tenant_id: 'tenant_preview',
		data: {
			assessment_id: 'assessment_preview_002',
			title: 'Draft Assessment',
			status: 'draft',
		},
	},
	deviceCreated: deviceCreatedFixture,
};

export function getPlatformFixture(eventKey: PlatformEventKey): IDataObject {
	return FIXTURES[eventKey] || entityStatusChangedFixture;
}
