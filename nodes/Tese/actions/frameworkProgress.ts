import type { IDataObject } from 'n8n-workflow';
import type { ActionContext } from './helpers';
import { buildReportingContextHeaders, request, unsupported } from './helpers';

const BASE = '/api/v3/external/esg/framework-progress';

export async function executeFrameworkProgress(ctx: ActionContext): Promise<IDataObject> {
	const { execute, operation, itemIndex } = ctx;
	const headers = buildReportingContextHeaders(execute, itemIndex);

	switch (operation) {
		case 'getProgress': {
			const includeQuestions = execute.getNodeParameter(
				'includeQuestions',
				itemIndex,
				false,
			) as boolean;
			return request(ctx, {
				path: BASE,
				qs: includeQuestions ? { include_questions: 'true' } : undefined,
				headers,
			});
		}
		case 'getQuestionContext': {
			const questionId = execute.getNodeParameter('questionId', itemIndex) as string;
			return request(ctx, {
				path: `${BASE}/question-context`,
				qs: { question_id: questionId },
				headers,
			});
		}
		default:
			return unsupported(ctx, 'framework progress');
	}
}
