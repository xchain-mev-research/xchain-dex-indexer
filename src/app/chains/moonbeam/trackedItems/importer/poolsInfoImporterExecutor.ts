import { logger } from '@app/core/log/logger';
import { StellaV2PoolsInfoImporter } from './stellaswap/StellaswapV2Importer';
import { StellaV3PoolsInfoImporter } from "./stellaswap/StellaswapV3Importer";


// Usage: npx ts-node --project tsconfig.json -r dotenv/config -r tsconfig-paths/register src/app/chains/moonbeam/trackedItems/importer/poolsInfoImporterExecutor.ts

async function main() {
    var baseOutputDir =
        "src/app/chains/moonbeam/trackedItems/pools/generated/"

    var blockNumber = 11_608_164;
    var minReserveUSD = 3_000;

    // StellaSwap
    var stellaOutputDir = "stellaswap";
    // StellaSwap - V2
    await new StellaV2PoolsInfoImporter().execute(
        blockNumber, minReserveUSD,
        baseOutputDir + stellaOutputDir, "StellaswapTrackedPoolsV2.ts");

    // StellaSwap - V3 
    await new StellaV3PoolsInfoImporter().execute(
        blockNumber, minReserveUSD,
        baseOutputDir + stellaOutputDir, "StellaswapTrackedPoolsV3.ts");

    // END StellaSwap
}


main()
    .then(() => {
        logger.info(" poolsInfo Import - DONE");
    }
    ).catch((error) => {
        logger.error(error);
    });