import type { IDataObject, IHttpRequestOptions, INode, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export type TeseHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface TeseApiCredentials {
	baseUrl: string;
	apiKey: string;
}

export interface TeseRequestOptions {
	method?: TeseHttpMethod;
	path: string;
	qs?: IDataObject;
	body?: IDataObject | IDataObject[];
	headers?: IDataObject;
}

function trimBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}

function buildUrl(baseUrl: string, path: string, qs?: IDataObject): string {
	const url = new URL(`${trimBaseUrl(baseUrl)}${path}`);
	if (qs) {
		for (const [key, value] of Object.entries(qs)) {
			if (value !== undefined && value !== null && value !== '') {
				url.searchParams.set(key, String(value));
			}
		}
	}
	return url.toString();
}

async function readErrorBody(response: IDataObject): Promise<string> {
	const body = response.body ?? response;
	if (typeof body === 'string') return body.slice(0, 500);
	try {
		return JSON.stringify(body).slice(0, 500);
	} catch {
		return '';
	}
}

export async function teseApiRequest(
	this: {
		helpers: {
			httpRequest: (options: IHttpRequestOptions) => Promise<unknown>;
		};
		getNode: () => INode;
	},
	credentials: TeseApiCredentials,
	options: TeseRequestOptions,
	itemIndex?: number,
): Promise<unknown> {
	const { method = 'GET', path, qs, body, headers = {} } = options;

	const requestOptions: IHttpRequestOptions = {
		method,
		url: buildUrl(credentials.baseUrl, path, qs),
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...headers,
		},
		json: true,
	};

	if (body !== undefined && method !== 'GET') {
		requestOptions.body = body;
	}

	try {
		return await this.helpers.httpRequest(requestOptions);
	} catch (error) {
		const apiError = error as {
			message?: string;
			statusCode?: number;
			response?: IDataObject & { statusCode?: number };
		};
		const statusCode = apiError.statusCode ?? apiError.response?.statusCode;
		const message = apiError.message ?? 'tese.io API request failed';
		const bodySnippet = apiError.response
			? await readErrorBody(apiError.response as IDataObject)
			: '';

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			itemIndex,
			message: bodySnippet ? `${message}: ${bodySnippet}` : message,
			httpCode: typeof statusCode === 'number' ? String(statusCode) : undefined,
		});
	}
}

export async function teseApiRequestWithToken(
	this: {
		helpers: {
			httpRequest: (options: IHttpRequestOptions) => Promise<unknown>;
		};
		getNode: () => INode;
	},
	baseUrl: string,
	token: string,
	options: TeseRequestOptions,
	itemIndex?: number,
): Promise<unknown> {
	return teseApiRequest.call(this, { baseUrl, apiKey: token }, options, itemIndex);
}
