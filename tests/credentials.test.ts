/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TeseApi } from '../credentials/TeseApi.credentials';

describe('TeseApi credentials', () => {
	it('masks api key in the UI', () => {
		const apiKeyField = new TeseApi().properties.find((field) => field.name === 'apiKey');
		assert.ok(apiKeyField);
		assert.equal(apiKeyField?.typeOptions?.password, true);
	});

	it('tests credentials against v3 external facilities endpoint', () => {
		const credential = new TeseApi();
		assert.deepEqual(credential.test, {
			request: {
				baseURL: '={{$credentials.baseUrl.replace(/\\/$/, "")}}',
				url: '/api/v3/external/facilities',
				method: 'GET',
				qs: {
					limit: 1,
				},
				headers: {
					Authorization: '=Bearer {{$credentials.apiKey}}',
					Accept: 'application/json',
				},
			},
		});
	});
});
