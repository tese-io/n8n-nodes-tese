import type { INodeProperties } from 'n8n-workflow';
import {
	jsonBodyField,
	fqlOnlyFields,
	idField,
	requestBodyField,
	updatesField,
	resourceBodyField,
} from './fields';

function operationsBlock(
	resource: string,
	options: Array<{ name: string; value: string; action: string }>,
	defaultOp: string,
): INodeProperties {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options,
		default: defaultOp,
	};
}

export const extendedOperations: INodeProperties[] = [
	operationsBlock(
		'answerBank',
		[
			{
				name: 'Audit Metrics Answers',
				value: 'auditMetricsAnswers',
				action: 'Audit metrics answers',
			},
			{ name: 'Carbon Summary', value: 'carbonSummary', action: 'Get carbon summary' },
			{ name: 'Create', value: 'create', action: 'Create an answer' },
			{ name: 'Delete', value: 'delete', action: 'Delete an answer' },
			{ name: 'FQL Query', value: 'fql', action: 'Query answer bank with FQL' },
			{ name: 'Get', value: 'get', action: 'Get an answer' },
			{ name: 'Get Many', value: 'getAll', action: 'List answers' },
			{ name: 'Unique Metrics', value: 'uniqueMetrics', action: 'Get unique metrics' },
			{ name: 'Update', value: 'update', action: 'Update an answer' },
		],
		'getAll',
	),
	operationsBlock(
		'questionBank',
		[
			{ name: 'FQL Query', value: 'fql', action: 'Query question bank with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a question' },
			{
				name: 'Get Activity Inputs',
				value: 'getActivityInputs',
				action: 'List activity input questions',
			},
		],
		'getActivityInputs',
	),
	operationsBlock(
		'aggregation',
		[
			{ name: 'Batch', value: 'batch', action: 'Run batch aggregation' },
			{ name: 'Batch Answers', value: 'batchAnswers', action: 'Batch aggregate answers' },
			{ name: 'Batch Questions', value: 'batchQuestions', action: 'Batch aggregate questions' },
			{ name: 'Execute', value: 'execute', action: 'Execute aggregation' },
			{ name: 'Force Update', value: 'forceUpdate', action: 'Force update aggregation' },
			{ name: 'Health', value: 'health', action: 'Check aggregation health' },
			{
				name: 'Portfolio Batch Answers',
				value: 'portfolioBatchAnswers',
				action: 'Portfolio batch answers',
			},
			{ name: 'Preview', value: 'preview', action: 'Preview aggregation' },
		],
		'preview',
	),
	operationsBlock(
		'formulaExecution',
		[
			{ name: 'Batch Execute', value: 'batchExecute', action: 'Batch execute formulas' },
			{ name: 'Execute', value: 'execute', action: 'Execute a formula' },
		],
		'execute',
	),
	operationsBlock(
		'sustainabilityTargets',
		[
			{ name: 'Analytics Legend', value: 'analyticsLegend', action: 'Get analytics legend data' },
			{ name: 'Create', value: 'create', action: 'Create a sustainability target' },
			{ name: 'Delete', value: 'delete', action: 'Delete a sustainability target' },
			{ name: 'FQL Query', value: 'fql', action: 'Query sustainability targets with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a sustainability target' },
			{ name: 'Get Many', value: 'getAll', action: 'List sustainability targets' },
			{ name: 'Update', value: 'update', action: 'Update a sustainability target' },
		],
		'getAll',
	),
	operationsBlock(
		'emissionFactors',
		[
			{ name: 'Get', value: 'get', action: 'Get an emission factor' },
			{ name: 'Get Many', value: 'getAll', action: 'List emission factors' },
		],
		'getAll',
	),
	operationsBlock(
		'frameworkPack',
		[
			{ name: 'Create', value: 'create', action: 'Create a framework pack' },
			{ name: 'Delete', value: 'delete', action: 'Delete a framework pack' },
			{ name: 'FQL Query', value: 'fql', action: 'Query framework packs with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a framework pack' },
			{ name: 'Get Many', value: 'getAll', action: 'List framework packs' },
			{ name: 'Update', value: 'update', action: 'Update a framework pack' },
		],
		'getAll',
	),
	operationsBlock(
		'frameworkPackAnswer',
		[
			{ name: 'Create', value: 'create', action: 'Create a framework pack answer' },
			{ name: 'Delete', value: 'delete', action: 'Delete a framework pack answer' },
			{ name: 'FQL Query', value: 'fql', action: 'Query framework pack answers with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a framework pack answer' },
			{ name: 'Get Many', value: 'getAll', action: 'List framework pack answers' },
			{ name: 'Update', value: 'update', action: 'Update a framework pack answer' },
		],
		'getAll',
	),
	operationsBlock(
		'normalisedAnswerBank',
		[{ name: 'FQL Query', value: 'fql', action: 'Query normalised answer bank with FQL' }],
		'fql',
	),
	operationsBlock(
		'compositeKpi',
		[
			{ name: 'Analytics', value: 'analytics', action: 'Get composite KPI analytics' },
			{ name: 'Calculate', value: 'calculate', action: 'Calculate a composite KPI' },
			{ name: 'Create', value: 'create', action: 'Create a composite KPI' },
			{ name: 'Delete', value: 'delete', action: 'Delete a composite KPI' },
			{ name: 'Get', value: 'get', action: 'Get a composite KPI' },
			{ name: 'List', value: 'list', action: 'List composite KPIs' },
			{ name: 'Update', value: 'update', action: 'Update a composite KPI' },
		],
		'list',
	),
	operationsBlock(
		'materialityAssessments',
		[
			{ name: 'Create', value: 'create', action: 'Create a materiality assessment' },
			{ name: 'Delete', value: 'delete', action: 'Delete a materiality assessment' },
			{ name: 'Get Many', value: 'getAll', action: 'List materiality assessments' },
			{ name: 'Publish', value: 'publish', action: 'Publish a materiality assessment' },
			{ name: 'Summary', value: 'summary', action: 'Get materiality summary' },
			{ name: 'Unpublish', value: 'unpublish', action: 'Unpublish a materiality assessment' },
			{ name: 'Update', value: 'update', action: 'Update a materiality assessment' },
		],
		'getAll',
	),
	operationsBlock(
		'validationBank',
		[{ name: 'FQL Query', value: 'fql', action: 'Query validation bank with FQL' }],
		'fql',
	),
	operationsBlock(
		'evidenceManager',
		[{ name: 'FQL Query', value: 'fql', action: 'Query evidence manager with FQL' }],
		'fql',
	),
	operationsBlock(
		'reportingCovenants',
		[
			{ name: 'Approve', value: 'approve', action: 'Approve a covenant' },
			{ name: 'Approve Submission', value: 'approveSubmission', action: 'Approve a submission' },
			{ name: 'Create Submission', value: 'createSubmission', action: 'Create a submission' },
			{ name: 'Dashboard', value: 'dashboard', action: 'Get covenant dashboard' },
			{ name: 'Deals', value: 'deals', action: 'List covenant deals' },
			{ name: 'Get Many', value: 'getAll', action: 'List reporting covenants' },
			{ name: 'Reject Submission', value: 'rejectSubmission', action: 'Reject a submission' },
			{ name: 'Submissions', value: 'submissions', action: 'List submissions' },
			{ name: 'Update Approvers', value: 'updateApprovers', action: 'Update covenant approvers' },
			{ name: 'Update Assignees', value: 'updateAssignees', action: 'Update covenant assignees' },
			{ name: 'Update Submission', value: 'updateSubmission', action: 'Update a submission' },
			{ name: 'Waive Submission', value: 'waiveSubmission', action: 'Waive a submission' },
		],
		'getAll',
	),
	operationsBlock(
		'spt',
		[
			{ name: 'Create', value: 'create', action: 'Create an SPT record' },
			{ name: 'Delete', value: 'delete', action: 'Delete an SPT record' },
			{ name: 'FQL Query', value: 'fql', action: 'Query SPT with FQL' },
			{ name: 'Get', value: 'get', action: 'Get an SPT record' },
			{ name: 'Get Many', value: 'getAll', action: 'List SPT records' },
			{ name: 'Update', value: 'update', action: 'Update an SPT record' },
		],
		'getAll',
	),
	operationsBlock(
		'devices',
		[
			{ name: 'Create', value: 'create', action: 'Create a device' },
			{ name: 'Delete', value: 'delete', action: 'Delete a device' },
			{ name: 'FQL Query', value: 'fql', action: 'Query devices with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a device' },
			{ name: 'Get Many', value: 'getAll', action: 'List devices' },
			{ name: 'Update', value: 'update', action: 'Update a device' },
		],
		'getAll',
	),
];

export const extendedFields: INodeProperties[] = [
	// Answer Bank
	idField('Answer ID', 'answerId', 'answerBank', ['get', 'update', 'delete']),
	jsonBodyField('Answer', 'answerBankJson', 'answerBank', 'create', 'Answer bank document JSON'),
	...fqlOnlyFields('answerBank'),
	updatesField('answerBank'),
	requestBodyField('answerBank', ['uniqueMetrics', 'auditMetricsAnswers']),

	// Question Bank
	{
		displayName: 'Question Name or ID',
		name: 'questionId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: 'getQuestionBank' },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['questionBank'], operation: ['get'] } },
	},
	...fqlOnlyFields('questionBank'),

	// Aggregation / Formula / request-body resources
	requestBodyField('aggregation', [
		'execute',
		'preview',
		'batch',
		'batchQuestions',
		'batchAnswers',
		'portfolioBatchAnswers',
		'forceUpdate',
	]),
	requestBodyField('formulaExecution', ['execute', 'batchExecute']),
	requestBodyField('sustainabilityTargets', ['analyticsLegend']),
	resourceBodyField('sustainabilityTargets'),
	idField('Target ID', 'targetId', 'sustainabilityTargets', ['get', 'update', 'delete']),
	...fqlOnlyFields('sustainabilityTargets'),
	updatesField('sustainabilityTargets'),

	// Emission Factors
	idField('Factor ID', 'factorId', 'emissionFactors', ['get']),

	// Framework Pack
	idField('Assessment ID', 'assessmentId', 'frameworkPack', ['get', 'update', 'delete']),
	resourceBodyField('frameworkPack'),
	...fqlOnlyFields('frameworkPack'),
	updatesField('frameworkPack'),

	// Framework Pack Answer
	idField('Answer ID', 'frameworkPackAnswerId', 'frameworkPackAnswer', ['get', 'update', 'delete']),
	resourceBodyField('frameworkPackAnswer'),
	...fqlOnlyFields('frameworkPackAnswer'),
	updatesField('frameworkPackAnswer'),

	// FQL-only banks
	...fqlOnlyFields('normalisedAnswerBank'),
	...fqlOnlyFields('validationBank'),
	...fqlOnlyFields('evidenceManager'),

	// Composite KPI
	idField('Composite KPI ID', 'compositeKpiId', 'compositeKpi', [
		'get',
		'update',
		'delete',
		'calculate',
	]),
	resourceBodyField('compositeKpi'),
	updatesField('compositeKpi'),
	requestBodyField('compositeKpi', ['list', 'calculate']),

	// Materiality
	idField('Record ID', 'recordId', 'materialityAssessments', [
		'update',
		'delete',
		'publish',
		'unpublish',
	]),
	resourceBodyField('materialityAssessments'),
	updatesField('materialityAssessments'),

	// Reporting Covenants
	idField('Covenant ID', 'covenantId', 'reportingCovenants', [
		'approve',
		'updateAssignees',
		'updateApprovers',
	]),
	idField('Submission ID', 'submissionId', 'reportingCovenants', [
		'approveSubmission',
		'rejectSubmission',
		'waiveSubmission',
		'updateSubmission',
	]),
	requestBodyField('reportingCovenants', [
		'createSubmission',
		'approve',
		'updateAssignees',
		'updateApprovers',
		'approveSubmission',
		'rejectSubmission',
		'waiveSubmission',
		'updateSubmission',
	]),

	// SPT / Devices
	idField('SPT ID', 'sptId', 'spt', ['get', 'update', 'delete']),
	resourceBodyField('spt'),
	...fqlOnlyFields('spt'),
	updatesField('spt'),
	idField('Device ID', 'deviceId', 'devices', ['get', 'update', 'delete']),
	resourceBodyField('devices'),
	...fqlOnlyFields('devices'),
	updatesField('devices'),
];
