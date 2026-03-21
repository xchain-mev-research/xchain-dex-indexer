import { PoolsInfoImporter } from "@app/core/trackedPools/PoolsInfoImporter";


export class StellaV2PoolsInfoImporter extends PoolsInfoImporter {

  private static readonly RESULT_VARIABLE_NAME = "STELLASWAP_TRACKED_POOLS_V2";

  constructor() {
    super(STELLA_V2_GRAPH_URL, STELLA_V2_GRAPH_QUERY, "ITrackedV2Pool",
      StellaV2PoolsInfoImporter.RESULT_VARIABLE_NAME, "pairs");
  }

}

const STELLA_V2_GRAPH_URL = "https://analytics.stellaswap.com/api/graphql/v2";
const STELLA_V2_GRAPH_QUERY = `query  MyQuery {
  
   pairs(
    orderBy: reserveUSD
    orderDirection: desc
    where: {reserveUSD_gt: ${StellaV2PoolsInfoImporter.$MIN_RESERVE_USD}}
    block: {number: ${StellaV2PoolsInfoImporter.$BLOCK_NUMBER}}
  ) {
    id
    reserveUSD
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