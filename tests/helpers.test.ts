/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { IExecuteFunctions, INode } from 'n8n-workflow';
import {
	extractListItems,
	parseJsonParameter,
	toNodeOptions,
	wrapResponse,
} from '../nodes/Tese/actions/helpers';

const mockNode = { name: 'tese', type: 'n8n-nodes-tese.tese' } as INode;

function mockExecute(parameters: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter(name: string, ..._args: unknown[]) {
			void _args;
			return parameters[name];
		},
		getNode: () => mockNode,
	} as unknown as IExecuteFunctions;
}

describe('action helpers', () => {
	describe('parseJsonParameter', () => {
		it('returns object parameters as-is', () => {
			const body = { filter: { active: true } };
			const result = parseJsonParameter(mockExecute({ fqlBody: body }), 'fqlBody', 0);
			assert.deepEqual(result, body);
		});

		it('parses JSON strings', () => {
			const result = parseJsonParameter(mockExecute({ fqlBody: '{"page":1}' }), 'fqlBody', 0);
			assert.deepEqual(result, { page: 1 });
		});
	});

	describe('wrapResponse', () => {
		it('simplifies array responses', () => {
			const result = wrapResponse([{ id: 1 }, { id: 2 }], true);
			assert.deepEqual(result, { items: [{ id: 1 }, { id: 2 }], count: 2 });
		});

		it('passes through objects when simplify is false', () => {
			const payload = { ok: true, id: 'abc' };
			assert.deepEqual(wrapResponse(payload, false), payload);
		});
	});

	describe('extractListItems', () => {
		it('reads data array from API envelope', () => {
			const items = extractListItems({ data: [{ _id: '1' }] });
			assert.equal(items.length, 1);
			assert.equal(items[0]._id, '1');
		});
	});

	describe('toNodeOptions', () => {
		it('builds loadOptions entries from list items', () => {
			const options = toNodeOptions([{ _id: 'cycle-1', name: 'FY2026' }], '_id', ['name', 'title']);
			assert.deepEqual(options, [{ name: 'FY2026', value: 'cycle-1' }]);
		});
	});
});
