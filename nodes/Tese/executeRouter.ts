import type { IExecuteFunctions, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { TeseApiCredentials } from '../shared/teseApiRequest';
import { routeTeseOperation } from './actions/index';
export { extractListItems, toNodeOptions } from './actions/helpers';

export { routeTeseOperation };

export async function executeTeseRouter(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];
	const credentials = (await this.getCredentials('teseApi')) as TeseApiCredentials;

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {
			const responseData = await routeTeseOperation.call(this, credentials, itemIndex);
			returnData.push({
				json: responseData,
				pairedItem: { item: itemIndex },
			});
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: (error as Error).message },
					pairedItem: { item: itemIndex },
				});
				continue;
			}
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}
	}

	return [returnData];
}
