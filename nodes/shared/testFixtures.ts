import type { IDataObject } from 'n8n-workflow';

export const activityFormulaFixture: IDataObject = {
	Question: {
		question_id: 'Q_ACTIVITY_PREVIEW',
		title: 'Sample Activity Question',
		kind: 'activity_input',
		nature: 'quantitative',
		formula_source: 'n8n',
		n8n_config: {
			workflow_id: 'preview-workflow-id',
			webhook_url: 'https://n8n.tese.io/webhook/preview',
		},
		fields: [
			{ id: 'distance_km', label: 'Distance', type: 'number', unit_of_measure: 'km' },
			{ id: 'fuel_type', label: 'Fuel Type', type: 'dropdown', options: ['diesel', 'petrol'] },
		],
	},
	answer: {
		question_id: 'Q_ACTIVITY_PREVIEW',
		answer_id: 'ANSWER_PREVIEW_001',
		submitted_at: '2026-01-15T10:00:00.000Z',
		values: {
			distance_km: { value: 120.5, unit_code: 'km' },
			fuel_type: { value: 'diesel', unit_code: null },
		},
	},
	callback_url: 'https://api.tese.io/api/v3/esg/activity-store/webhook/n8n-callback',
	finalize_token: 'preview-finalize-jwt-token',
	finalize_url: 'https://api.tese.io/api/v3/external/esg/aggregation/n8n/finalize',
	expected_output: {
		value: 'number (e.g. carbon_emission)',
		unit_code: 'string (optional)',
	},
};

export const activityAggregationFixture: IDataObject = {
	Question: {
		question_id: 'Q_AGGREGATE_PREVIEW',
		title: 'Sample Aggregation Question',
		kind: 'activity_aggregate',
		aggregation_config: {
			activity_type: 'fuel_purchase',
			source_question_id: 'Q_ACTIVITY_SOURCE',
			use_n8n: true,
		},
	},
	activities: [
		{
			activity_id: 'activity_1',
			timestamp: '2026-01-01T00:00:00.000Z',
			value: 50,
			value_unit_code: 'liters',
			include: true,
		},
		{
			activity_id: 'activity_2',
			timestamp: '2026-01-02T00:00:00.000Z',
			value: 75,
			value_unit_code: 'liters',
			include: true,
		},
	],
	aggregation_context: {
		tenant_id: 'tenant_preview',
		facility_id: 'facility_preview',
		reporting_cycle_id: 'cycle_2026_Q1',
		start_date: '2026-01-01T00:00:00.000Z',
		end_date: '2026-03-31T23:59:59.999Z',
		question_id: 'Q_AGGREGATE_PREVIEW',
	},
	callback_url: 'https://api.tese.io/api/v3/esg/aggregation/n8n-callback',
	finalize_token: 'preview-finalize-jwt-token',
	finalize_url: 'https://api.tese.io/api/v3/external/esg/aggregation/n8n/finalize',
	expected_output: {
		value: 'number (aggregated result)',
		unit_code: 'string (optional)',
		answer_bank_id: 'string (optional)',
	},
};

export function getTriggerFixture(eventType: string): IDataObject {
	if (eventType === 'activityAggregation') return activityAggregationFixture;
	return activityFormulaFixture;
}
