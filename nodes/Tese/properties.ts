import type { INodeProperties } from 'n8n-workflow';
import { extendedFields, extendedOperations } from './properties/extended';

const resourceOptions: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Activity', value: 'activity' },
		{ name: 'Aggregation', value: 'aggregation' },
		{ name: 'Answer Bank', value: 'answerBank' },
		{ name: 'Audit Request', value: 'auditRequest' },
		{ name: 'Composite KPI', value: 'compositeKpi' },
		{ name: 'Device', value: 'devices' },
		{ name: 'Emission Factor', value: 'emissionFactors' },
		{ name: 'ESG Data', value: 'esgData' },
		{ name: 'Evidence Manager', value: 'evidenceManager' },
		{ name: 'Facility', value: 'facility' },
		{ name: 'Formula Execution', value: 'formulaExecution' },
		{ name: 'Framework', value: 'framework' },
		{ name: 'Framework Pack', value: 'frameworkPack' },
		{ name: 'Framework Pack Answer', value: 'frameworkPackAnswer' },
		{ name: 'Materiality Assessment', value: 'materialityAssessments' },
		{ name: 'Metric Catalog', value: 'metricCatalog' },
		{ name: 'Normalised Answer Bank', value: 'normalisedAnswerBank' },
		{ name: 'Question Bank', value: 'questionBank' },
		{ name: 'Report', value: 'report' },
		{ name: 'Reporting Covenant', value: 'reportingCovenants' },
		{ name: 'SPT', value: 'spt' },
		{ name: 'Sustainability Target', value: 'sustainabilityTargets' },
		{ name: 'Validation Bank', value: 'validationBank' },
	],
	default: 'facility',
};

const paginationFields: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page number (1-indexed)',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		description: 'Max number of results to return',
	},
];

const simplifyOutputField: INodeProperties = {
	displayName: 'Simplify Output',
	name: 'simplifyOutput',
	type: 'boolean',
	default: true,
	description: 'Whether to return a simplified version of the response instead of the raw data',
};

function jsonBodyField(
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

const facilityOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['facility'] } },
	options: [
		{ name: 'Create', value: 'create', action: 'Create a facility' },
		{ name: 'Delete', value: 'delete', action: 'Delete a facility' },
		{ name: 'FQL Query', value: 'fql', action: 'Query facilities with FQL' },
		{ name: 'Get', value: 'get', action: 'Get a facility' },
		{ name: 'Get Many', value: 'getAll', action: 'List facilities' },
		{ name: 'Update', value: 'update', action: 'Update a facility' },
	],
	default: 'getAll',
};

const activityOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['activity'] } },
	options: [
		{ name: 'Archive', value: 'archive', action: 'Archive an activity' },
		{ name: 'Create', value: 'create', action: 'Create an activity' },
		{ name: 'Get', value: 'get', action: 'Get an activity' },
		{ name: 'Get Many', value: 'getAll', action: 'List activities' },
		{ name: 'Update', value: 'update', action: 'Update an activity' },
	],
	default: 'getAll',
};

const metricCatalogOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['metricCatalog'] } },
	options: [
		{ name: 'Create', value: 'create', action: 'Create a metric' },
		{ name: 'Delete', value: 'delete', action: 'Delete a metric' },
		{ name: 'FQL Query', value: 'fql', action: 'Query metrics with FQL' },
		{ name: 'Get', value: 'get', action: 'Get a metric' },
		{ name: 'Get By Framework', value: 'getByFramework', action: 'Get metrics by framework' },
		{ name: 'Get Filters', value: 'getFilters', action: 'Get metric catalog filters' },
		{ name: 'Get Many', value: 'getAll', action: 'List metrics' },
		{ name: 'Resolve By Codes', value: 'resolveByCodes', action: 'Resolve metrics by codes' },
		{ name: 'Update', value: 'update', action: 'Update a metric' },
	],
	default: 'getAll',
};

const esgDataOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['esgData'] } },
	options: [
		{ name: 'Create', value: 'create', action: 'Create ESG data' },
		{ name: 'Delete', value: 'delete', action: 'Delete ESG data' },
		{ name: 'FQL Query', value: 'fql', action: 'Query ESG data with FQL' },
		{ name: 'Get', value: 'get', action: 'Get ESG data' },
		{ name: 'Get By Category', value: 'getByCategory', action: 'Get ESG data by category' },
		{ name: 'Get By Date Range', value: 'getByDateRange', action: 'Get ESG data by date range' },
		{ name: 'Update', value: 'update', action: 'Update ESG data' },
	],
	default: 'fql',
};

const frameworkOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['framework'] } },
	options: [
		{ name: 'Create', value: 'create', action: 'Create a framework' },
		{ name: 'Delete', value: 'delete', action: 'Delete a framework' },
		{ name: 'FQL Query', value: 'fql', action: 'Query frameworks with FQL' },
		{ name: 'Get', value: 'get', action: 'Get a framework' },
		{ name: 'Get Many', value: 'getAll', action: 'List frameworks' },
		{ name: 'Update', value: 'update', action: 'Update a framework' },
	],
	default: 'getAll',
};

const auditRequestOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['auditRequest'] } },
	options: [
		{ name: 'Add Message', value: 'addMessage', action: 'Add an audit message' },
		{ name: 'Create', value: 'create', action: 'Create an audit request' },
		{ name: 'Delete', value: 'delete', action: 'Delete an audit request' },
		{ name: 'FQL Query', value: 'fql', action: 'Query audit requests with FQL' },
		{ name: 'Get', value: 'get', action: 'Get an audit request' },
		{ name: 'Get By Status', value: 'getByStatus', action: 'Get audit requests by status' },
		{
			name: 'Get User Accessible',
			value: 'getUserAccessible',
			action: 'Get user accessible audit requests',
		},
		{ name: 'Update', value: 'update', action: 'Update an audit request' },
	],
	default: 'fql',
};

const reportOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['report'] } },
	options: [
		{ name: 'Approve', value: 'approve', action: 'Approve a report' },
		{
			name: 'Check Published Exists',
			value: 'checkPublishedExists',
			action: 'Check published report exists',
		},
		{ name: 'FQL Query', value: 'fql', action: 'Query reports with FQL' },
		{ name: 'Get', value: 'get', action: 'Get a report' },
		{ name: 'Get By Period', value: 'getByPeriod', action: 'Get reports by period' },
		{ name: 'Get Many', value: 'getAll', action: 'List reports' },
		{ name: 'Reject', value: 'reject', action: 'Reject a report' },
		{ name: 'Submit For Review', value: 'submitForReview', action: 'Submit a report for review' },
	],
	default: 'getAll',
};

export const teseProperties: INodeProperties[] = [
	resourceOptions,
	facilityOperations,
	activityOperations,
	metricCatalogOperations,
	esgDataOperations,
	frameworkOperations,
	auditRequestOperations,
	reportOperations,
	...extendedOperations,
	simplifyOutputField,

	// ── Facility ──────────────────────────────────────────────────────────────
	...paginationFields.map((field) => ({
		...field,
		displayOptions: { show: { resource: ['facility'], operation: ['getAll'] } },
	})),
	{
		displayName: 'Facility ID',
		name: 'facilityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['facility'], operation: ['get', 'update', 'delete'] } },
	},
	jsonBodyField('Facility', 'facilityJson', 'facility', 'create', 'Facility document JSON'),
	jsonBodyField('FQL Body', 'fqlBody', 'facility', 'fql', 'FQL query object JSON'),
	jsonBodyField('Updates', 'updatesJson', 'facility', 'update', 'Partial facility fields JSON'),

	// ── Activity ──────────────────────────────────────────────────────────────
	...paginationFields.map((field) => ({
		...field,
		displayOptions: { show: { resource: ['activity'], operation: ['getAll'] } },
	})),
	{
		displayName: 'Activity ID',
		name: 'activityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['activity'], operation: ['get', 'update', 'archive'] } },
	},
	jsonBodyField('Activity', 'activityJson', 'activity', 'create', 'Activity document JSON'),
	jsonBodyField('Updates', 'updatesJson', 'activity', 'update', 'Partial activity fields JSON'),

	// ── Metric Catalog ────────────────────────────────────────────────────────
	...paginationFields.map((field) => ({
		...field,
		displayOptions: { show: { resource: ['metricCatalog'], operation: ['getAll'] } },
	})),
	{
		displayName: 'Metric ID',
		name: 'metricId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['metricCatalog'], operation: ['get', 'update', 'delete'] },
		},
	},
	{
		displayName: 'Framework Name or ID',
		name: 'frameworkId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: 'getFrameworks' },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['metricCatalog'], operation: ['getByFramework'] } },
	},
	jsonBodyField('Metric', 'metricJson', 'metricCatalog', 'create', 'Metric document JSON'),
	jsonBodyField('FQL Body', 'fqlBody', 'metricCatalog', 'fql', 'FQL query object JSON'),
	jsonBodyField('Updates', 'updatesJson', 'metricCatalog', 'update', 'Partial metric fields JSON'),
	{
		displayName: 'Codes',
		name: 'codes',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'GHG-001, WATER-002',
		description: 'Comma-separated metric codes to resolve',
		displayOptions: { show: { resource: ['metricCatalog'], operation: ['resolveByCodes'] } },
	},

	// ── ESG Data ──────────────────────────────────────────────────────────────
	{
		displayName: 'ESG Data ID',
		name: 'esgDataId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['esgData'], operation: ['get', 'update', 'delete'] } },
	},
	jsonBodyField('ESG Data', 'esgDataJson', 'esgData', 'create', 'ESG data document JSON'),
	jsonBodyField('FQL Body', 'fqlBody', 'esgData', 'fql', 'FQL query object JSON'),
	jsonBodyField('Updates', 'updatesJson', 'esgData', 'update', 'Partial ESG data fields JSON'),
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		required: true,
		options: [
			{ name: 'Environment', value: 'E' },
			{ name: 'Social', value: 'S' },
			{ name: 'Governance', value: 'G' },
		],
		default: 'E',
		displayOptions: { show: { resource: ['esgData'], operation: ['getByCategory'] } },
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2024-01-01',
		displayOptions: { show: { resource: ['esgData'], operation: ['getByDateRange'] } },
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2024-12-31',
		displayOptions: { show: { resource: ['esgData'], operation: ['getByDateRange'] } },
	},

	// ── Framework ───────────────────────────────────────────────────────────
	{
		displayName: 'Framework Name or ID',
		name: 'frameworkId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: 'getFrameworks' },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['framework'], operation: ['get', 'update', 'delete'] } },
	},
	jsonBodyField('Framework', 'frameworkJson', 'framework', 'create', 'Framework document JSON'),
	jsonBodyField('FQL Body', 'fqlBody', 'framework', 'fql', 'FQL query object JSON'),
	jsonBodyField('Updates', 'updatesJson', 'framework', 'update', 'Partial framework fields JSON'),

	// ── Audit Request ─────────────────────────────────────────────────────────
	{
		displayName: 'Audit Request ID',
		name: 'auditRequestId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['auditRequest'],
				operation: ['get', 'update', 'delete', 'addMessage'],
			},
		},
	},
	jsonBodyField(
		'Audit Request',
		'auditRequestJson',
		'auditRequest',
		'create',
		'Audit request document JSON',
	),
	jsonBodyField('FQL Body', 'fqlBody', 'auditRequest', 'fql', 'FQL query object JSON'),
	jsonBodyField(
		'Updates',
		'updatesJson',
		'auditRequest',
		'update',
		'Partial audit request fields JSON',
	),
	jsonBodyField('Message', 'messageJson', 'auditRequest', 'addMessage', 'Audit message body JSON'),
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		options: [
			{ name: 'Cancelled', value: 'cancelled' },
			{ name: 'Completed', value: 'completed' },
			{ name: 'In Progress', value: 'in_progress' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Rejected', value: 'rejected' },
		],
		default: 'pending',
		displayOptions: { show: { resource: ['auditRequest'], operation: ['getByStatus'] } },
	},

	// ── Report ────────────────────────────────────────────────────────────────
	{
		displayName: 'Report ID',
		name: 'reportId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['get', 'submitForReview', 'approve', 'reject'],
			},
		},
	},
	jsonBodyField('FQL Body', 'fqlBody', 'report', 'fql', 'FQL query object JSON'),
	jsonBodyField(
		'Period Query',
		'periodQueryJson',
		'report',
		'getByPeriod',
		'Report period query JSON',
	),
	jsonBodyField(
		'Submit Body',
		'submitBodyJson',
		'report',
		'submitForReview',
		'Submit-for-review body JSON (assigneeIds, reviewerNotes)',
	),
	jsonBodyField('Reject Body', 'rejectBodyJson', 'report', 'reject', 'Reject body JSON'),
	{
		displayName: 'Check Published Query',
		name: 'checkPublishedQuery',
		type: 'json',
		default: '{}',
		description: 'Optional query parameters for check-published-exists',
		displayOptions: { show: { resource: ['report'], operation: ['checkPublishedExists'] } },
	},
	...extendedFields,
];
