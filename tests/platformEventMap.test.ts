/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { IDataObject } from 'n8n-workflow';
import { shouldAcceptPlatformPayload } from '../nodes/shared/platformEventMap';
import { resolveSubscribeEvent } from '../nodes/shared/platformSubscription';

describe('platform event helpers', () => {
	it('maps task status trigger to ENTITY_STATUS_CHANGED subscription', () => {
		assert.equal(resolveSubscribeEvent('taskStatusChanged'), 'ENTITY_STATUS_CHANGED');
	});

	it('filters task events from generic entity status payloads', () => {
		const payload: IDataObject = {
			event: 'ENTITY_STATUS_CHANGED',
			data: { entityType: 'report', entityId: 'r1' },
		};
		assert.equal(shouldAcceptPlatformPayload('taskStatusChanged', payload), false);
		assert.equal(shouldAcceptPlatformPayload('reportStatusChanged', payload), true);
	});

	it('accepts task approval decided payloads without entity filter', () => {
		const payload: IDataObject = {
			event: 'TASK_APPROVAL_DECIDED',
			data: { status: 'approved' },
		};
		assert.equal(shouldAcceptPlatformPayload('taskApprovalDecided', payload), true);
	});
});
