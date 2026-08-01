import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { TeseApiCredentials } from '../../shared/teseApiRequest';
import { executeActivity } from './activity';
import { executeAggregation } from './aggregation';
import { executeAnswerBank } from './answerBank';
import { executeAuditRequest } from './auditRequest';
import { executeCompositeKpi } from './compositeKpi';
import { executeDevices } from './devices';
import { executeEmissionFactors } from './emissionFactors';
import { executeEsgData } from './esgData';
import { executeEvidenceManager } from './evidenceManager';
import { executeFacility } from './facility';
import { executeFormulaExecution } from './formulaExecution';
import { executeFramework } from './framework';
import { executeFrameworkPack } from './frameworkPack';
import { executeFrameworkPackAnswer } from './frameworkPackAnswer';
import { executeMaterialityAssessments } from './materialityAssessments';
import { executeMetricCatalog } from './metricCatalog';
import { executeNormalisedAnswerBank } from './normalisedAnswerBank';
import { executeQuestionBank } from './questionBank';
import { executeReport } from './report';
import { executeReportingCovenants } from './reportingCovenants';
import { executeSpt } from './spt';
import { executeSustainabilityTargets } from './sustainabilityTargets';
import { executeValidationBank } from './validationBank';
import type { ActionContext } from './helpers';

const resourceHandlers: Record<string, (ctx: ActionContext) => Promise<IDataObject>> = {
	facility: executeFacility,
	activity: executeActivity,
	metricCatalog: executeMetricCatalog,
	esgData: executeEsgData,
	framework: executeFramework,
	auditRequest: executeAuditRequest,
	report: executeReport,
	answerBank: executeAnswerBank,
	questionBank: executeQuestionBank,
	aggregation: executeAggregation,
	formulaExecution: executeFormulaExecution,
	sustainabilityTargets: executeSustainabilityTargets,
	emissionFactors: executeEmissionFactors,
	frameworkPack: executeFrameworkPack,
	frameworkPackAnswer: executeFrameworkPackAnswer,
	normalisedAnswerBank: executeNormalisedAnswerBank,
	compositeKpi: executeCompositeKpi,
	materialityAssessments: executeMaterialityAssessments,
	validationBank: executeValidationBank,
	reportingCovenants: executeReportingCovenants,
	evidenceManager: executeEvidenceManager,
	spt: executeSpt,
	devices: executeDevices,
};

export async function routeTeseOperation(
	this: IExecuteFunctions,
	credentials: TeseApiCredentials,
	itemIndex: number,
): Promise<IDataObject> {
	const resource = this.getNodeParameter('resource', itemIndex) as string;
	const operation = this.getNodeParameter('operation', itemIndex) as string;
	const simplify = this.getNodeParameter('simplifyOutput', itemIndex, true) as boolean;

	const handler = resourceHandlers[resource];
	if (!handler) {
		throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
			itemIndex,
		});
	}

	return handler({
		execute: this,
		credentials,
		operation,
		itemIndex,
		simplify,
	});
}
