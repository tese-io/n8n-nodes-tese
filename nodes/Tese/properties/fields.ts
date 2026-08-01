import type { INodeProperties } from 'n8n-workflow';

export function jsonBodyField(
	displayName: string,
	name: string,
	resource: string,
	operation: string | string[],
	description: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'json',
		default: '{}',
		required: true,
		description,
		displayOptions: {
			show: {
				resource: [resource],
				operation: Array.isArray(operation) ? operation : [operation],
			},
		},
	};
}

export function idField(
	displayName: string,
	name: string,
	resource: string,
	operations: string[],
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: [resource], operation: operations },
		},
	};
}

export function fqlOnlyFields(resource: string): INodeProperties[] {
	return [jsonBodyField('FQL Body', 'fqlBody', resource, 'fql', 'FQL query object JSON')];
}

export function updatesField(resource: string): INodeProperties {
	return jsonBodyField('Updates', 'updatesJson', resource, 'update', 'Partial update fields JSON');
}

export function resourceBodyField(resource: string): INodeProperties {
	return jsonBodyField(
		'Resource Body',
		'resourceJson',
		resource,
		'create',
		'Resource document JSON',
	);
}

export function requestBodyField(resource: string, operations: string[]): INodeProperties {
	return jsonBodyField(
		'Request Body',
		'requestBodyJson',
		resource,
		operations,
		'Request body JSON',
	);
}
