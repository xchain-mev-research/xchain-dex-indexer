import * as fs from 'fs';
import * as path from 'path';
import { graphqlRequest } from '../graphql/graphqlRequest';
import { logger } from '../log/logger';

export class PoolsInfoImporter {

    public static readonly $MIN_RESERVE_USD = "$minReserveUSD";
    public static readonly $BLOCK_NUMBER = "$blockNumber";

    private url: string;
    private query: string;

    private resultVariableName: string;
    private resultType: string;
    private apiResultDataName: string;

    constructor(url: string, query: string, resultType: string, resultVariableName: string, apiResultDataName: string) {
        this.url = url;
        this.query = query;
        this.resultVariableName = resultVariableName;
        this.resultType = resultType;
        this.apiResultDataName = apiResultDataName;
    }

    public async execute(
        blockNumber: number, minReserveUSD: number,
        outputDir: string, fileName: string
    ): Promise<void> {

        var queryCompleted = this.query.replace(PoolsInfoImporter.$BLOCK_NUMBER, blockNumber.toString());
        queryCompleted = queryCompleted.replace(PoolsInfoImporter.$MIN_RESERVE_USD, minReserveUSD.toString());

        logger.info(`📡 Querying ${this.url} with blockNumber=${blockNumber} and minReserveUSD=${minReserveUSD}`);

        const resultData = await graphqlRequest(this.url, queryCompleted);

        const filePath = path.join(outputDir, fileName);

        fs.mkdirSync(outputDir, { recursive: true });
        var resultContent = `
import { onlyWithMoonbeamWhiteListedTokens } from '@app/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager';
import { ${this.resultType} } from "@common/trackedPools/trackedPoolsTypes";

// Data retrieved at block number ${blockNumber}
export const ${this.resultVariableName}: Array<${this.resultType}> = onlyWithMoonbeamWhiteListedTokens(${JSON.stringify(resultData.data[this.apiResultDataName], null, 2)}
    );`;
        fs.writeFileSync(filePath, resultContent);

        logger.info(`✅ Result saved to: ${filePath}`);
    }
}
