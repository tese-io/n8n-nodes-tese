/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import {
	createMockExecute,
	lastRequest,
	resetCapturedRequests,
	setupActionRequestMock,
} from './actionHarness';

describe('Analytics nodes (Anomaly + Climate)', () => {
	before(() => {
		setupActionRequestMock();
	});

	beforeEach(() => {
		resetCapturedRequests();
	});

	async function runAnomaly(operation: string, parameters: Record<string, unknown>) {
		const { TeseAnomaly } = await import('../nodes/TeseAnomaly/TeseAnomaly.node');
		const node = new TeseAnomaly();
		const execute = createMockExecute({ operation, simplify: false, ...parameters });
		(execute as unknown as { getCredentials: () => Promise<unknown> }).getCredentials =
			async () => ({
				baseUrl: 'https://api.tese.io',
				apiKey: 'test-api-key',
			});
		(execute as unknown as { getInputData: () => unknown[] }).getInputData = () => [{ json: {} }];
		await node.execute.call(execute as never);
		return lastRequest();
	}

	async function runClimate(operation: string, parameters: Record<string, unknown>) {
		const { TeseClimate } = await import('../nodes/TeseClimate/TeseClimate.node');
		const node = new TeseClimate();
		const execute = createMockExecute({ operation, simplify: false, ...parameters });
		(execute as unknown as { getCredentials: () => Promise<unknown> }).getCredentials =
			async () => ({
				baseUrl: 'https://api.tese.io',
				apiKey: 'test-api-key',
			});
		(execute as unknown as { getInputData: () => unknown[] }).getInputData = () => [{ json: {} }];
		await node.execute.call(execute as never);
		return lastRequest();
	}

	it('lists anomalies with filters', async () => {
		const req = await runAnomaly('getMany', {
			reportId: 'rep-1',
			status: 'active',
			limit: 25,
		});
		assert.equal(req.path, '/api/v3/external/anomaly');
		assert.deepEqual(req.qs, { report_id: 'rep-1', status: 'active', limit: 25 });
	});

	it('starts anomaly detection by record IDs', async () => {
		const req = await runAnomaly('processByIds', {
			recordIdsJson: ['ans-1', 'ans-2'],
		});
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/anomaly/process-by-ids');
		assert.deepEqual(req.body, { record_ids: ['ans-1', 'ans-2'] });
	});

	it('starts climate prediction job', async () => {
		const req = await runClimate('startPrediction', {
			locationId: 'loc-1',
			latitude: -20.16,
			longitude: 57.5,
			futureYear: 2050,
			baselineYearsJson: { start_year: 1991, end_year: 2020 },
		});
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/climate/predict');
		assert.deepEqual(req.body, {
			location_id: 'loc-1',
			latitude: -20.16,
			longitude: 57.5,
			future_year: 2050,
			baseline_years: { start_year: 1991, end_year: 2020 },
		});
	});

	it('computes climate impact', async () => {
		const req = await runClimate('computeClimateImpact', {
			climateImpactJson: {
				location_id: 'loc-1',
				polygon_id: 'poly-9',
				selected_activity_tags: ['TOU-CT-ADAC-04.01'],
				future_year: 2050,
			},
		});
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/climate/climate-impact');
	});
});
