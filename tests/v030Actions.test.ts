/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import type { IDataObject } from 'n8n-workflow';
import {
	capturedRequests,
	createActionContext,
	lastRequest,
	resetCapturedRequests,
	setupActionRequestMock,
} from './actionHarness';

type ActionExecutor = (ctx: ReturnType<typeof createActionContext>) => Promise<IDataObject>;

let executeReportingCycle: ActionExecutor;
let executeTaskApproval: ActionExecutor;
let executeTaskIssue: ActionExecutor;
let executeTaskWorkflow: ActionExecutor;

describe('v0.3 action modules', () => {
	before(async () => {
		setupActionRequestMock();
		const modules = await Promise.all([
			import('../nodes/Tese/actions/reportingCycle'),
			import('../nodes/Tese/actions/taskApproval'),
			import('../nodes/Tese/actions/taskIssue'),
			import('../nodes/Tese/actions/taskWorkflow'),
		]);
		executeReportingCycle = modules[0].executeReportingCycle;
		executeTaskApproval = modules[1].executeTaskApproval;
		executeTaskIssue = modules[2].executeTaskIssue;
		executeTaskWorkflow = modules[3].executeTaskWorkflow;
	});

	beforeEach(() => {
		resetCapturedRequests();
	});

	describe('executeReportingCycle', () => {
		it('posts FQL to reporting-cycle fql endpoint', async () => {
			await executeReportingCycle(
				createActionContext('fql', { fqlBody: { filter: { status: 'active' } } }),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/reporting-cycle/fql');
			assert.deepEqual(req.body, { filter: { status: 'active' } });
		});

		it('lists reporting cycles', async () => {
			await executeReportingCycle(
				createActionContext('list', { requestBodyJson: { page: 1, limit: 10 } }),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/reporting-cycle/reporting-cycle-list');
			assert.deepEqual(req.body, { page: 1, limit: 10 });
		});

		it('gets a reporting cycle by id', async () => {
			await executeReportingCycle(createActionContext('get', { reportingCycleId: 'cycle-abc' }));
			const req = lastRequest();
			assert.equal(req.method, undefined);
			assert.equal(req.path, '/api/v3/external/reporting-cycle/cycle-abc');
		});

		it('creates a reporting cycle', async () => {
			await executeReportingCycle(
				createActionContext('create', { resourceJson: { name: 'FY2026' } }),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/reporting-cycle');
			assert.deepEqual(req.body, { name: 'FY2026' });
		});

		it('updates a reporting cycle', async () => {
			await executeReportingCycle(
				createActionContext('update', {
					reportingCycleId: 'cycle-abc',
					updatesJson: { name: 'FY2026 Updated' },
				}),
			);
			const req = lastRequest();
			assert.equal(req.method, 'PUT');
			assert.equal(req.path, '/api/v3/external/reporting-cycle/cycle-abc');
			assert.deepEqual(req.body, { name: 'FY2026 Updated' });
		});

		it('deletes a reporting cycle', async () => {
			await executeReportingCycle(createActionContext('delete', { reportingCycleId: 'cycle-abc' }));
			const req = lastRequest();
			assert.equal(req.method, 'DELETE');
			assert.equal(req.path, '/api/v3/external/reporting-cycle/cycle-abc');
		});
	});

	describe('executeTaskApproval', () => {
		it('lists approvals with query filters', async () => {
			await executeTaskApproval(
				createActionContext('list', {
					status: 'pending',
					entityType: 'issue',
					entityId: 'ent-1',
					reviewerId: 'user-1',
				}),
			);
			const req = lastRequest();
			assert.equal(req.path, '/api/v3/external/task-manager/approvals/list');
			assert.deepEqual(req.qs, {
				status: 'pending',
				entity_type: 'issue',
				entity_id: 'ent-1',
				reviewer_id: 'user-1',
			});
		});

		it('gets pending approval count', async () => {
			await executeTaskApproval(createActionContext('pendingCount'));
			const req = lastRequest();
			assert.equal(req.path, '/api/v3/external/task-manager/approvals/pending-count');
		});

		it('approves by approval id', async () => {
			await executeTaskApproval(
				createActionContext('approve', {
					approvalId: 'appr-1',
					requestBodyJson: { comment: 'LGTM' },
				}),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/task-manager/approvals/appr-1/approve');
			assert.deepEqual(req.body, { comment: 'LGTM' });
		});

		it('approves by entity', async () => {
			await executeTaskApproval(
				createActionContext('entityApprove', {
					entityType: 'issue',
					entityId: 'issue-9',
					requestBodyJson: { user_id: 'user-1' },
				}),
			);
			const req = lastRequest();
			assert.equal(
				req.path,
				'/api/v3/external/task-manager/approvals/entity/issue/issue-9/approve',
			);
			assert.deepEqual(req.body, { user_id: 'user-1' });
		});
	});

	describe('executeTaskIssue', () => {
		it('posts FQL for issues', async () => {
			await executeTaskIssue(
				createActionContext('fql', { fqlBody: { filter: { assignee: 'user-1' } } }),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/task-manager/issues/fql');
		});

		it('fetches my tasks', async () => {
			await executeTaskIssue(
				createActionContext('myTasks', { requestBodyJson: { user_id: 'user-1' } }),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/task-manager/issues/my-tasks');
			assert.deepEqual(req.body, { user_id: 'user-1' });
		});

		it('reviews an issue', async () => {
			await executeTaskIssue(
				createActionContext('review', {
					issueId: 'issue-42',
					requestBodyJson: { action: 'approve' },
				}),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/task-manager/issues/issue-42/review');
		});

		it('patches an issue', async () => {
			await executeTaskIssue(
				createActionContext('update', {
					issueId: 'issue-42',
					updatesJson: { title: 'Updated title' },
				}),
			);
			const req = lastRequest();
			assert.equal(req.method, 'PATCH');
			assert.equal(req.path, '/api/v3/external/task-manager/issues/issue-42');
		});
	});

	describe('executeTaskWorkflow', () => {
		it('gets workflow for entity type', async () => {
			await executeTaskWorkflow(createActionContext('forEntity', { entityType: 'issue' }));
			const req = lastRequest();
			assert.equal(req.path, '/api/v3/external/task-manager/workflows/for-entity/issue');
		});

		it('validates a transition', async () => {
			await executeTaskWorkflow(
				createActionContext('validateTransition', {
					requestBodyJson: { from: 'open', to: 'in_review' },
				}),
			);
			const req = lastRequest();
			assert.equal(req.method, 'POST');
			assert.equal(req.path, '/api/v3/external/task-manager/workflows/validate-transition');
			assert.deepEqual(req.body, { from: 'open', to: 'in_review' });
		});
	});

	describe('unsupported operations', () => {
		it('throws for unknown reporting cycle operation', async () => {
			await assert.rejects(
				() => executeReportingCycle(createActionContext('unknownOp')),
				/Unsupported reporting cycle operation/,
			);
			assert.equal(capturedRequests.length, 0);
		});
	});
});
