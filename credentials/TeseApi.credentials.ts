import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class TeseApi implements ICredentialType {
	name = 'teseApi';

	displayName = 'tese.io API';

	icon = {
		light: 'file:../nodes/Tese/tese.svg',
		dark: 'file:../nodes/Tese/tese.dark.svg',
	} as const;

	documentationUrl = 'https://docs.tese.io';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.tese.io',
			placeholder: 'https://api.tese.io',
			description: 'TESE backend base URL (no trailing slash)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description:
				'Tenant external API key from TESE Settings. Sent as Authorization: Bearer <key>.',
		},
	];

	test: ICredentialTestRequest = {
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
	};
}
