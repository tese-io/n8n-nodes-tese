/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { IDataObject } from 'n8n-workflow';
import {
	buildFinalizeBody,
	buildFinalizeHeaders,
	extractFinalizeToken,
	resolveFinalizeUrl,
} from '../nodes/shared/finalizeHelpers';

describe('extractFinalizeToken', () => {
	it('returns finalize_token from the item root', () => {
		const token = extractFinalizeToken({ finalize_token: 'abc123' });
		assert.equal(token, 'abc123');
	});

	it('returns bearer token from finalize_contract.auth', () => {
		const token = extractFinalizeToken({
			finalize_contract: {
				auth: { bearer: 'Bearer jwt-token-here' },
			},
		});
		assert.equal(token, 'jwt-token-here');
	});

	it('returns undefined when no token is present', () => {
		assert.equal(extractFinalizeToken({}), undefined);
	});
});

describe('buildFinalizeHeaders', () => {
	it('prefers finalize token over api key', () => {
		const headers = buildFinalizeHeaders({
			finalizeToken: 'jwt-token',
			apiKey: 'api-key',
			workflowId: 'wf-1',
			runId: 'run-1',
			correlationId: 'corr-1',
			idempotencyKey: 'idem-1',
		});

		assert.equal(headers.Authorization, 'Bearer jwt-token');
		assert.equal(headers['X-Workflow-Id'], 'wf-1');
		assert.equal(headers['X-Run-Id'], 'run-1');
		assert.equal(headers['X-Correlation-Id'], 'corr-1');
		assert.equal(headers['Idempotency-Key'], 'idem-1');
	});

	it('throws when no auth is available', () => {
		assert.throws(() => buildFinalizeHeaders({}), /No finalize auth available/);
	});
});

describe('buildFinalizeBody', () => {
	const aggregationItem: IDataObject = {
		Question: { question_id: 'Q_AGG' },
		aggregation_context: {
			tenant_id: 'tenant-1',
			facility_id: 'facility-1',
			reporting_cycle_id: 'cycle-1',
			question_id: 'Q_AGG',
		},
		answer_bank_id: 'bank-1',
	};

	it('builds aggregation finalize body', () => {
		const body = buildFinalizeBody(aggregationItem, 'aggregation', {
			value: 150,
			unit_code: 'liters',
		});

		assert.equal(body.kind, 'aggregation');
		assert.equal(body.tenant_id, 'tenant-1');
		assert.equal(body.facility_id, 'facility-1');
		assert.equal(body.reporting_cycle_id, 'cycle-1');
		assert.equal(body.question_id, 'Q_AGG');
		assert.equal(body.answer_bank_id, 'bank-1');
		assert.equal(body.value, 150);
		assert.equal(body.unit_code, 'liters');
	});

	it('builds activity finalize body', () => {
		const item: IDataObject = {
			Question: { question_id: 'Q_ACT' },
			answer: { answer_id: 'ANS-1' },
			activity_id: 'ACT-1',
			tenant_id: 'tenant-2',
			facility_id: 'facility-2',
			reporting_cycle_id: 'cycle-2',
		};

		const body = buildFinalizeBody(item, 'activity', { value: 42 });

		assert.equal(body.kind, 'activity');
		assert.equal(body.answer_id, 'ANS-1');
		assert.equal(body.activity_id, 'ACT-1');
		assert.equal(body.question_id, 'Q_ACT');
		assert.equal(body.value, 42);
	});

	it('builds formula finalize body', () => {
		const item: IDataObject = {
			Question: { question_id: 'Q_FORM', formula_source: 'n8n' },
			answer: { answer_id: 'ANS-2' },
		};

		const body = buildFinalizeBody(item, 'formula', { value: 99, unit_code: 'kg' });

		assert.equal(body.kind, 'formula');
		assert.equal(body.answer_id, 'ANS-2');
		assert.equal(body.question_id, 'Q_FORM');
	});
});

describe('resolveFinalizeUrl', () => {
	it('uses finalize_contract.finalize_url when present', () => {
		const url = resolveFinalizeUrl(
			{ finalize_contract: { finalize_url: 'https://custom.example/finalize' } },
			'https://api.tese.io',
		);
		assert.equal(url, 'https://custom.example/finalize');
	});

	it('falls back to default external finalize path', () => {
		const url = resolveFinalizeUrl({}, 'https://api.tese.io/');
		assert.equal(url, 'https://api.tese.io/api/v3/external/esg/aggregation/n8n/finalize');
	});
});
