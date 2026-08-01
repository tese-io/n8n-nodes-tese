import type { IDataObject } from 'n8n-workflow';
import { randomUUID } from 'node:crypto';

export interface FinalizeHeaderInput {
	finalizeToken?: string;
	apiKey?: string;
	workflowId?: string;
	runId?: string;
	correlationId?: string;
	idempotencyKey?: string;
}

export function extractFinalizeToken(item: IDataObject): string | undefined {
	const direct = item.finalize_token;
	if (typeof direct === 'string' && direct.trim()) return direct.trim();

	const contract = item.finalize_contract as IDataObject | undefined;
	if (contract?.auth) {
		const auth = contract.auth as IDataObject;
		const bearer = auth.bearer;
		if (typeof bearer === 'string' && bearer.startsWith('Bearer ')) {
			return bearer.slice('Bearer '.length).trim();
		}
	}

	return undefined;
}

export function buildFinalizeHeaders(input: FinalizeHeaderInput): IDataObject {
	const token = input.finalizeToken?.trim();
	const apiKey = input.apiKey?.trim();

	const authorization = token ? `Bearer ${token}` : apiKey ? `Bearer ${apiKey}` : undefined;

	if (!authorization) {
		throw new Error(
			'No finalize auth available. Provide finalize_token from the trigger payload or configure Tese API credentials.',
		);
	}

	return {
		Authorization: authorization,
		'Content-Type': 'application/json',
		'Idempotency-Key': input.idempotencyKey ?? randomUUID(),
		'X-Workflow-Id': input.workflowId ?? 'n8n-workflow',
		'X-Run-Id': input.runId ?? randomUUID(),
		'X-Correlation-Id': input.correlationId ?? randomUUID(),
	};
}

export function buildFinalizeBody(
	item: IDataObject,
	kind: 'activity' | 'aggregation' | 'formula',
	overrides: IDataObject = {},
): IDataObject {
	const aggregationContext = item.aggregation_context as IDataObject | undefined;
	const question = item.Question as IDataObject | undefined;
	const answer = item.answer as IDataObject | undefined;

	const tenantId =
		(overrides.tenant_id as string | undefined) ??
		(aggregationContext?.tenant_id as string | undefined) ??
		(item.tenant_id as string | undefined);

	const facilityId =
		(overrides.facility_id as string | undefined) ??
		(aggregationContext?.facility_id as string | undefined) ??
		(item.facility_id as string | undefined);

	const reportingCycleId =
		(overrides.reporting_cycle_id as string | undefined) ??
		(aggregationContext?.reporting_cycle_id as string | undefined) ??
		(item.reporting_cycle_id as string | undefined);

	const body: IDataObject = {
		kind,
		tenant_id: tenantId,
		facility_id: facilityId,
		reporting_cycle_id: reportingCycleId,
		...overrides,
	};

	if (kind === 'aggregation') {
		body.question_id =
			(overrides.question_id as string | undefined) ??
			(question?.question_id as string | undefined) ??
			(aggregationContext?.question_id as string | undefined);
		body.answer_bank_id =
			(overrides.answer_bank_id as string | undefined) ??
			(item.answer_bank_id as string | undefined);
	}

	if (kind === 'activity' || kind === 'formula') {
		body.answer_id =
			(overrides.answer_id as string | undefined) ?? (answer?.answer_id as string | undefined);
		body.activity_id =
			(overrides.activity_id as string | undefined) ?? (item.activity_id as string | undefined);
		body.question_id =
			(overrides.question_id as string | undefined) ??
			(question?.question_id as string | undefined);
	}

	return body;
}

export function resolveFinalizeUrl(item: IDataObject, baseUrl: string): string {
	const contract = item.finalize_contract as IDataObject | undefined;
	if (typeof contract?.finalize_url === 'string') return contract.finalize_url;
	if (typeof item.finalize_url === 'string') return item.finalize_url;
	return `${baseUrl.replace(/\/+$/, '')}/api/v3/external/esg/aggregation/n8n/finalize`;
}
