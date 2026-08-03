/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import type { IDataObject } from 'n8n-workflow';
import {
	createActionContext,
	lastRequest,
	resetCapturedRequests,
	setupActionRequestMock,
} from './actionHarness';

type ActionExecutor = (ctx: ReturnType<typeof createActionContext>) => Promise<IDataObject>;

let executeFrameworkProgress: ActionExecutor;
let executeActivityPins: ActionExecutor;

describe('v0.7 framework progress and activity pins', () => {
	before(async () => {
		setupActionRequestMock();
		const modules = await Promise.all([
			import('../nodes/Tese/actions/frameworkProgress'),
			import('../nodes/Tese/actions/activityPins'),
		]);
		executeFrameworkProgress = modules[0].executeFrameworkProgress;
		executeActivityPins = modules[1].executeActivityPins;
	});

	beforeEach(() => {
		resetCapturedRequests();
	});

	it('gets framework progress with reporting context headers', async () => {
		await executeFrameworkProgress(
			createActionContext('getProgress', {
				includeQuestions: true,
				facilityId: 'fac-1',
				reportingCycleId: 'cycle-1',
			}),
		);

		const req = lastRequest();
		assert.equal(req.path, '/api/v3/external/esg/framework-progress');
		assert.deepEqual(req.qs, { include_questions: 'true' });
		assert.deepEqual(req.headers, {
			'x-location-id': 'fac-1',
			'x-reporting-cycle': 'cycle-1',
		});
	});

	it('gets question context for a field question', async () => {
		await executeFrameworkProgress(
			createActionContext('getQuestionContext', {
				questionId: 'Q_ACTIVITY_ELECTRICITY',
				facilityId: 'fac-2',
			}),
		);

		const req = lastRequest();
		assert.equal(req.path, '/api/v3/external/esg/framework-progress/question-context');
		assert.deepEqual(req.qs, { question_id: 'Q_ACTIVITY_ELECTRICITY' });
		assert.deepEqual(req.headers, { 'x-location-id': 'fac-2' });
	});

	it('gets tenant activity hub', async () => {
		await executeActivityPins(
			createActionContext('getHub', { userId: 'user-7', facilityId: 'fac-3' }),
		);

		const req = lastRequest();
		assert.equal(req.path, '/api/v3/external/esg/tenant-activity-pins');
		assert.deepEqual(req.qs, { user_id: 'user-7' });
		assert.deepEqual(req.headers, { 'x-location-id': 'fac-3' });
	});

	it('updates tenant activity hub pins', async () => {
		await executeActivityPins(
			createActionContext('updateHub', {
				hubJson: { pinned_activity_question_ids: ['Q_ACTIVITY_WATER'] },
			}),
		);

		const req = lastRequest();
		assert.equal(req.method, 'PUT');
		assert.equal(req.path, '/api/v3/external/esg/tenant-activity-pins');
		assert.deepEqual(req.body, { pinned_activity_question_ids: ['Q_ACTIVITY_WATER'] });
	});

	it('adds a personal activity pin for a user', async () => {
		await executeActivityPins(
			createActionContext('addPin', {
				questionId: 'Q_ACTIVITY_GAS',
				userId: 'user-9',
			}),
		);

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/esg/tenant-activity-pins/pins');
		assert.deepEqual(req.body, {
			question_id: 'Q_ACTIVITY_GAS',
			user_id: 'user-9',
		});
	});
});
