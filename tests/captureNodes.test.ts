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

describe('Capture nodes (OCR + Voice)', () => {
	before(() => {
		setupActionRequestMock();
	});

	beforeEach(() => {
		resetCapturedRequests();
	});

	async function runOcr(parameters: Record<string, unknown>): Promise<IDataObject> {
		const { TeseOcr } = await import('../nodes/TeseOcr/TeseOcr.node');
		const node = new TeseOcr();
		const execute = createMockExecute({
			operation: 'processDocument',
			simplify: false,
			...parameters,
		});
		const credentials = { baseUrl: 'https://api.tese.io', apiKey: 'test-api-key' };

		(execute as unknown as { getCredentials: () => Promise<unknown> }).getCredentials = async () =>
			credentials;
		(execute as unknown as { getInputData: () => unknown[] }).getInputData = () => [{ json: {} }];

		const result = await node.execute.call(execute as never);
		return result[0][0].json as IDataObject;
	}

	async function runVoice(parameters: Record<string, unknown>): Promise<IDataObject> {
		const { TeseVoice } = await import('../nodes/TeseVoice/TeseVoice.node');
		const node = new TeseVoice();
		const execute = createMockExecute({
			operation: 'extractFields',
			simplify: false,
			...parameters,
		});
		const credentials = { baseUrl: 'https://api.tese.io', apiKey: 'test-api-key' };

		(execute as unknown as { getCredentials: () => Promise<unknown> }).getCredentials = async () =>
			credentials;
		(execute as unknown as { getInputData: () => unknown[] }).getInputData = () => [{ json: {} }];

		const result = await node.execute.call(execute as never);
		return result[0][0].json as IDataObject;
	}

	it('posts base64 OCR job to external capture endpoint', async () => {
		await runOcr({
			imageSource: 'base64',
			imageBase64: 'abc123',
			mimeType: 'image/jpeg',
			documentType: 'electricity_bill',
			hint: 'Octopus Energy bill',
			userId: 'user-1',
		});

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/capture/ocr/process');
		assert.deepEqual(req.body, {
			image_base64: 'abc123',
			mime_type: 'image/jpeg',
			document_type: 'electricity_bill',
			hint: 'Octopus Energy bill',
			user_id: 'user-1',
			evidence: { capture_method: 'upload' },
		});
	});

	it('posts image URL OCR job', async () => {
		await runOcr({
			imageSource: 'url',
			imageUrl: 'https://storage.example/bill.pdf',
			mimeType: 'application/pdf',
			documentType: 'gas_bill',
		});

		const req = lastRequest();
		assert.equal(req.path, '/api/v3/external/capture/ocr/process');
		assert.equal((req.body as IDataObject).image_url, 'https://storage.example/bill.pdf');
	});

	it('posts voice extraction with audio', async () => {
		await runVoice({
			inputMode: 'audio',
			audioBase64: 'audio-bytes',
			audioMime: 'audio/mp4',
			contextJson: {
				fields: [{ field_code: 'kwh', label: 'kWh', type: 'number', required: true }],
				facility_id: 'fac-1',
			},
		});

		const req = lastRequest();
		assert.equal(req.method, 'POST');
		assert.equal(req.path, '/api/v3/external/capture/voice/extract');
		assert.deepEqual(req.body, {
			audio_base64: 'audio-bytes',
			audio_mime: 'audio/mp4',
			context: {
				fields: [{ field_code: 'kwh', label: 'kWh', type: 'number', required: true }],
				facility_id: 'fac-1',
			},
		});
	});

	it('posts voice extraction with transcript', async () => {
		await runVoice({
			inputMode: 'transcript',
			transcript: 'The meter reading is 4521 kilowatt hours',
			contextJson: { question_text: 'Enter electricity consumption' },
		});

		const req = lastRequest();
		assert.equal(req.path, '/api/v3/external/capture/voice/extract');
		assert.equal((req.body as IDataObject).transcript, 'The meter reading is 4521 kilowatt hours');
	});
});
