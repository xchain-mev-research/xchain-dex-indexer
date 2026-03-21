import { StellaV3PoolsInfoImporter } from "@app/chains/moonbeam/trackedItems/importer/stellaswap/StellaswapV3Importer";
import { DexConfig } from "../config/DexConfig";
import { graphqlRequest } from "../graphql/graphqlRequest";
import { logger } from "../log/logger";
import { Parachain } from "../parachainUtils/ParachainConst";
import { GraphqlComparisonConfig, GraphqlDbComparator } from "./comparator/GraphqlDbComparator";
import { configsV2, configsV3, configsV4 } from "./support/configs";



async function main() {

    logger.info(" ---- Data Integrity Test START ----");
    const allConfigs: GraphqlComparisonConfig[] = [];
    //    allConfigs.push(...configsV2);
    //    allConfigs.push(...configsV3);
    allConfigs.push(configsV4[0]);

    const maxBlockNumber = 9_532_226;
    const comparisonsCount = 200;

    for (const testConfig of allConfigs) {
        const comparator = new GraphqlDbComparator(testConfig);
        const dexConfig = DexConfig.getConfig(testConfig.dexType, Parachain.Moonbeam);
        const minBlockNumber = testConfig.minBlockNumber || dexConfig!.factoryAddressCreatedAt;

        await compareRandomBlocksInRange(
            comparator,
            9_532_000, // minBlockNumber,
            maxBlockNumber
        );
    }

    logger.info(" ---- Data Integrity Test COMPLETE ----");
}

export async function compareRandomBlocksInRange(
    comparator: GraphqlDbComparator,
    startBlock: number,
    endBlock: number,
    comparisonsCount: number = 100
): Promise<void> {
    if (startBlock > endBlock) {
        throw new Error("Start block must be less than end block.");
    }
    if (comparisonsCount > endBlock - startBlock)
        comparisonsCount = endBlock - startBlock;

    const testedBlocks = new Set<number>();

    // Ensure edge cases are tested (start, end, mid)
    testedBlocks.add(startBlock);
    testedBlocks.add(endBlock);
    testedBlocks.add(Math.floor((startBlock + endBlock) / 2));

    // Fill remaining with random samples
    while (testedBlocks.size < comparisonsCount) {
        const randomBlock = Math.floor(Math.random() * (endBlock - startBlock + 1)) + startBlock;
        testedBlocks.add(randomBlock);
    }

    const sortedBlocks = Array.from(testedBlocks).sort((a, b) => a - b);
    var testedBlocksCount = 0;

    for (const block of sortedBlocks) {
        //        if (testedBlocksCount % 20 === 0)
        logger.info(`🔍 Comparison for block ${block}`);

        try {
            await comparator.compare(block);
            await delay(1_000); // wait 1 second

        } catch (err: any) {
            logger.error(`❌ Error in comparison at block ${block}:`, err.message);
        }

        testedBlocksCount++;
    }

    logger.info(`✅ Comparisons completed for ${testedBlocks.size} blocks.`);
}
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().then(() => {
    logger.info(" ---- PROCESS ENDED ----");
});