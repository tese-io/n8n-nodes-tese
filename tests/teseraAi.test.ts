/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import type { IDataObject } from 'n8n-workflow';
import {
	createMockExecute,
	lastRequest,
	resetCapturedRequests,
	setupActionRequestMock,
} from './actionHarness';

describe('Tesera AI node operations', () => {
	before(() => {
		setupActionRequestMock();
	});

	beforeEach(() => {
		resetCapturedRequests();
	});

	async function runOperation(
		operation: string,
		parameters: Record<string, unknown>,
	): Promise<IDataObject> {
		const { TeseraAi } = await import('../nodes/TeseraAi/TeseraAi.node');
		const node = new TeseraAi();
		const execute = createMockExecute({ operation, simplify: false, ...parameters });
		const credentials = { baseUrl: 'https://api.tese.io', apiKey: 'test-api-key' };

		(execute as unknown as { getCredentials: () => Promise<unknown> }).getCredentials = async () =>
			credentials;
		(execute as unknown as { getInputData: () => unknown[] }).getInputData = () => [{ json: {} }];

		const result = await node.execute.call(execute as never);
		return result[0][0].json as IDataObject;
	}

	it('posts one-shot query to external AI endpoint', async () => {
		await runOperation('query', {
			query: 'What is our total Scope 2 emissions?',
			portfolioGroupId: 'pg-123',
		});

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/ai/query');
		assert.deepEqual(req.body, {
			query: 'What is our total Scope 2 emissions?',
			extra_data: { portfolio_group_id: 'pg-123' },
		});
	});

	it('creates a chat session', async () => {
		await runOperation('createChat', { projectId: 'proj-1', userId: 'user-9' });

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/ai/chat/new');
		assert.deepEqual(req.body, { project_id: 'proj-1', user_id: 'user-9' });
	});

	it('sends a chat message', async () => {
		await runOperation('sendMessage', {
			sessionId: 'sess-abc',
			query: 'Summarize facility emissions',
			facilityId: 'fac-1',
		});

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/ai/chat/sess-abc/message');
		assert.deepEqual(req.body, {
			query: 'Summarize facility emissions',
			extra_data: { facility_id: 'fac-1' },
		});
	});

	it('gets chat history', async () => {
		await runOperation('getHistory', { sessionId: 'sess-abc' });

		const req = lastRequest();
		assert.equal(req.path, '/api/v3/external/ai/chat/sess-abc/history');
	});

	it('formats an action result', async () => {
		await runOperation('formatActionResult', {
			query: 'List facilities in Europe',
			toolId: 'list_facilities',
			rawDataJson: { items: [{ name: 'Plant A' }] },
		});

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/ai/format-action-result');
		assert.deepEqual(req.body, {
			query: 'List facilities in Europe',
			tool_id: 'list_facilities',
			raw_data: { items: [{ name: 'Plant A' }] },
		});
	});
});
