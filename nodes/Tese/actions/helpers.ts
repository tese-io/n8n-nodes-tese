import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	teseApiRequest,
	type TeseApiCredentials,
	type TeseRequestOptions,
} from '../../shared/teseApiRequest';

export function parseJsonParameter(
	executeFunctions: IExecuteFunctions,
	parameterName: string,
	itemIndex: number,
): IDataObject {
	const raw = executeFunctions.getNodeParameter(parameterName, itemIndex, '{}') as
		| string
		| IDataObject;
	if (typeof raw === 'object' && raw !== null) return raw as IDataObject;
	try {
		return JSON.parse(String(raw || '{}')) as IDataObject;
	} catch {
		throw new NodeOperationError(executeFunctions.getNode(), `Invalid JSON in "${parameterName}"`, {
			itemIndex,
		});
	}
}

export function splitCodes(codes: string): string[] {
	return codes
		.split(',')
		.map((code) => code.trim())
		.filter(Boolean);
}

function simplifyResponse(data: unknown): IDataObject {
	if (data === null || data === undefined) return {};
	if (Array.isArray(data)) {
		return { items: data, count: data.length };
	}
	if (typeof data === 'object') {
		const obj = data as IDataObject;
		if (Array.isArray(obj.data)) {
			return { items: obj.data, count: obj.data.length, ...(obj.meta ? { meta: obj.meta } : {}) };
		}
		if (Array.isArray(obj.items)) {
			return { items: obj.items, count: obj.items.length };
		}
		return obj;
	}
	return { value: data };
}

export function wrapResponse(data: unknown, simplify: boolean): IDataObject {
	if (simplify) return simplifyResponse(data);
	if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
		return data as IDataObject;
	}
	return { data: data as IDataObject };
}

export type ActionContext = {
	execute: IExecuteFunctions;
	credentials: TeseApiCredentials;
	operation: string;
	itemIndex: number;
	simplify: boolean;
};

export async function request(
	ctx: ActionContext,
	options: TeseRequestOptions,
): Promise<IDataObject> {
	const data = await teseApiRequest.call(ctx.execute, ctx.credentials, options, ctx.itemIndex);
	return wrapResponse(data, ctx.simplify);
}

export function unsupported(ctx: ActionContext, resource: string): never {
	throw new NodeOperationError(
		ctx.execute.getNode(),
		`Unsupported ${resource} operation: ${ctx.operation}`,
		{ itemIndex: ctx.itemIndex },
	);
}

export function extractListItems(data: unknown): IDataObject[] {
	if (Array.isArray(data)) return data as IDataObject[];
	if (typeof data === 'object' && data !== null) {
		const obj = data as IDataObject;
		if (Array.isArray(obj.data)) return obj.data as IDataObject[];
		if (Array.isArray(obj.items)) return obj.items as IDataObject[];
	}
	return [];
}

export function toNodeOptions(
	items: IDataObject[],
	idKey: string,
	labelKeys: string[],
): Array<{ name: string; value: string }> {
	return items
		.map((item) => {
			const value = String(item[idKey] ?? item._id ?? item.id ?? '');
			if (!value) return null;
			const label =
				labelKeys.map((key) => item[key]).find((part) => part !== undefined && part !== '') ??
				value;
			return { name: String(label), value };
		})
		.filter((option): option is { name: string; value: string } => option !== null);
}
