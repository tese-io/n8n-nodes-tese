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
		'activityPins',
		[
			{ name: 'Add Pin', value: 'addPin', action: 'Pin an activity question for a user' },
			{ name: 'Get Hub', value: 'getHub', action: 'Get tenant activity hub config' },
			{
				name: 'Update Hub',
				value: 'updateHub',
				action: 'Update pinned activities and assignments',
			},
		],
		'getHub',
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
		'frameworkProgress',
		[
			{ name: 'Get Progress', value: 'getProgress', action: 'Get framework completion progress' },
			{
				name: 'Get Question Context',
				value: 'getQuestionContext',
				action: 'Get answer bank and activities for a question',
			},
		],
		'getProgress',
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
	operationsBlock(
		'reportingCycle',
		[
			{ name: 'Create', value: 'create', action: 'Create a reporting cycle' },
			{ name: 'Delete', value: 'delete', action: 'Delete a reporting cycle' },
			{ name: 'FQL Query', value: 'fql', action: 'Query reporting cycles with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a reporting cycle' },
			{ name: 'List', value: 'list', action: 'List reporting cycles' },
			{ name: 'Update', value: 'update', action: 'Update a reporting cycle' },
		],
		'list',
	),
	operationsBlock(
		'taskApproval',
		[
			{ name: 'Approve', value: 'approve', action: 'Approve a task approval' },
			{ name: 'Entity Approve', value: 'entityApprove', action: 'Approve by entity' },
			{ name: 'Entity Reject', value: 'entityReject', action: 'Reject by entity' },
			{ name: 'Get', value: 'get', action: 'Get a task approval' },
			{ name: 'List', value: 'list', action: 'List task approvals' },
			{ name: 'Pending Count', value: 'pendingCount', action: 'Get pending approval count' },
			{ name: 'Reject', value: 'reject', action: 'Reject a task approval' },
		],
		'list',
	),
	operationsBlock(
		'taskIssue',
		[
			{ name: 'FQL Query', value: 'fql', action: 'Query task issues with FQL' },
			{ name: 'Get', value: 'get', action: 'Get a task issue' },
			{ name: 'My Tasks', value: 'myTasks', action: 'List my assigned tasks' },
			{ name: 'Review', value: 'review', action: 'Review a task issue' },
			{ name: 'Update', value: 'update', action: 'Update a task issue' },
		],
		'myTasks',
	),
	operationsBlock(
		'taskWorkflow',
		[
			{ name: 'For Entity', value: 'forEntity', action: 'Get workflow for entity type' },
			{
				name: 'Validate Transition',
				value: 'validateTransition',
				action: 'Validate workflow transition',
			},
		],
		'forEntity',
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

	// Reporting Cycle
	{
		displayName: 'Reporting Cycle Name or ID',
		name: 'reportingCycleId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: 'getReportingCycles' },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['reportingCycle'], operation: ['get', 'update', 'delete'] },
		},
	},
	resourceBodyField('reportingCycle'),
	...fqlOnlyFields('reportingCycle'),
	updatesField('reportingCycle'),
	requestBodyField('reportingCycle', ['list']),

	// Task Approval
	idField('Approval ID', 'approvalId', 'taskApproval', ['get', 'approve', 'reject']),
	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['taskApproval', 'taskWorkflow'],
				operation: ['list', 'entityApprove', 'entityReject', 'forEntity'],
			},
		},
	},
	idField('Entity ID', 'entityId', 'taskApproval', ['entityApprove', 'entityReject']),
	{
		displayName: 'Status',
		name: 'status',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['taskApproval'], operation: ['list'] } },
	},
	{
		displayName: 'Reviewer ID',
		name: 'reviewerId',
		type: 'string',
		default: '',
		description: 'Optional user ID when using API key automation',
		displayOptions: { show: { resource: ['taskApproval'], operation: ['list'] } },
	},
	requestBodyField('taskApproval', ['approve', 'reject', 'entityApprove', 'entityReject']),

	// Task Issue
	idField('Issue ID', 'issueId', 'taskIssue', ['get', 'update', 'review']),
	...fqlOnlyFields('taskIssue'),
	requestBodyField('taskIssue', ['myTasks', 'review']),
	updatesField('taskIssue'),

	// Task Workflow
	requestBodyField('taskWorkflow', ['validateTransition']),

	// Framework Progress + Activity Pins (Lite field entry)
	{
		displayName: 'Facility ID',
		name: 'facilityId',
		type: 'string',
		default: '',
		description: 'Scopes results to a facility (sent as x-location-ID header)',
		displayOptions: {
			show: {
				resource: ['frameworkProgress', 'activityPins'],
				operation: ['getProgress', 'getQuestionContext', 'getHub', 'addPin'],
			},
		},
	},
	{
		displayName: 'Reporting Cycle ID',
		name: 'reportingCycleId',
		type: 'string',
		default: '',
		description: 'Scopes results to a reporting cycle (sent as x-reporting-cycle header)',
		displayOptions: {
			show: {
				resource: ['frameworkProgress', 'activityPins'],
				operation: ['getProgress', 'getQuestionContext', 'getHub', 'addPin'],
			},
		},
	},
	{
		displayName: 'Include Questions',
		name: 'includeQuestions',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['frameworkProgress'], operation: ['getProgress'] },
		},
	},
	{
		displayName: 'Question ID',
		name: 'questionId',
		type: 'string',
		required: true,
		default: '',
		description: 'Activity question identifier (e.g. Q_ACTIVITY_...)',
		displayOptions: {
			show: {
				resource: ['frameworkProgress', 'activityPins'],
				operation: ['getQuestionContext', 'addPin'],
			},
		},
	},
	{
		displayName: 'Hub Config (JSON)',
		name: 'hubJson',
		type: 'json',
		default: '{}',
		required: true,
		description: 'Pinned activity question IDs and/or activity assignments',
		displayOptions: {
			show: { resource: ['activityPins'], operation: ['updateHub'] },
		},
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		description: 'Acting user for hub visibility and personal pins (API key automation)',
		displayOptions: {
			show: {
				resource: ['activityPins'],
				operation: ['getHub', 'addPin'],
			},
		},
	},
];
