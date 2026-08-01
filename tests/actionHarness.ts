import type { IExecuteFunctions, INode } from 'n8n-workflow';
import type { TeseRequestOptions } from '../nodes/shared/teseApiRequest';
import { setTeseApiRequestTestHandler } from '../nodes/shared/teseApiRequest';
import type { ActionContext } from '../nodes/Tese/actions/helpers';

export const capturedRequests: TeseRequestOptions[] = [];

const mockNode = { name: 'tese', type: 'n8n-nodes-tese.tese' } as INode;

export function setupActionRequestMock(): void {
	setTeseApiRequestTestHandler(async (_credentials, options) => {
		capturedRequests.push(options);
		return { data: [{ _id: 'mock-id', name: 'Mock Item' }] };
	});
}

export function resetCapturedRequests(): void {
	capturedRequests.length = 0;
}

export function createMockExecute(
	parameters: Record<string, unknown>,
	itemIndex = 0,
): IExecuteFunctions {
	return {
		getNodeParameter(name: string, index: number, defaultValue?: unknown) {
			if (index !== itemIndex) throw new Error(`Unexpected item index ${index}`);
			if (Object.prototype.hasOwnProperty.call(parameters, name)) {
				return parameters[name];
			}
			return defaultValue;
		},
		getNode: () => mockNode,
	} as unknown as IExecuteFunctions;
}

export function createActionContext(
	operation: string,
	parameters: Record<string, unknown> = {},
	simplify = false,
): ActionContext {
	return {
		execute: createMockExecute(parameters),
		credentials: { baseUrl: 'https://api.tese.io', apiKey: 'test-api-key' },
		operation,
		itemIndex: 0,
		simplify,
	};
}

export function lastRequest(): TeseRequestOptions {
	const last = capturedRequests.at(-1);
	if (!last) throw new Error('No request captured');
	return last;
}
