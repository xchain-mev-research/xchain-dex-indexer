import { PoolsInfoImporter } from "@app/core/trackedPools/PoolsInfoImporter";


export class StellaV3PoolsInfoImporter extends PoolsInfoImporter {

  private static readonly RESULT_VARIABLE_NAME = "STELLASWAP_TRACKED_POOLS_V3";

  constructor() {
    super(STELLA_V3_GRAPH_URL, STELLA_V3_GRAPH_QUERY, "ITrackedV3Pool",
      StellaV3PoolsInfoImporter.RESULT_VARIABLE_NAME, "pools");
  }

}


const STELLA_V3_GRAPH_URL = "https://analytics.stellaswap.com/api/graphql/v3";
const STELLA_V3_GRAPH_QUERY = `query  {
  
   pools(
    orderBy: totalValueLockedUSD	
    orderDirection: desc
    where: {totalValueLockedUSD_gt: ${StellaV3PoolsInfoImporter.$MIN_RESERVE_USD}}
    block: {number: ${StellaV3PoolsInfoImporter.$BLOCK_NUMBER}}
  ) {
    id
    totalValueLockedUSD
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }
  }
}
  
 `;