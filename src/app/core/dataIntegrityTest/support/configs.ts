import { STELLASWAP_TRACKED_POOLS_V2 } from "@app/chains/moonbeam/trackedItems/pools/generated/stellaswap/StellaswapTrackedPoolsV2";
import { STELLASWAP_TRACKED_POOLS_V3 } from "@app/chains/moonbeam/trackedItems/pools/generated/stellaswap/StellaswapTrackedPoolsV3";
import { BEAMSWAP_TRACKED_POOLS_V2 } from "@app/chains/moonbeam/trackedItems/pools/static/beamswap/BeamswapTrackedPoolsV2";
import { BEAMSWAP_TRACKED_POOLS_V3 } from "@app/chains/moonbeam/trackedItems/pools/static/beamswap/BeamswapTrackedPoolsV3";
import { DexType } from "@model/generated";
import { GraphqlComparisonConfig } from "../comparator/GraphqlDbComparator";
import { UniswapV2DataComparator } from "../comparator/UniswapV2DataComparator";
import { UniswapV3DataComparator } from "../comparator/UniswapV3DataComparator";
import { BEAMSWAP_V3_QUERY, LOCAL_V2_QUERY, LOCAL_V3_QUERY, LOCAL_V4_QUERY, STELLASWAP_V3_QUERY, UNISWAP_V2_QUERY } from "./officialSubgraphQueries";
import { STELLASWAP_TRACKED_POOLS_V4 } from "@app/chains/moonbeam/trackedItems/pools/static/stellaswap/StellaswapTrackedPoolsV4";

export const configsV2: GraphqlComparisonConfig[] = [
    {
        name: "Beamswap V2 Price Data",
        dexType: DexType.BEAMSWAP_V2,
        pools: BEAMSWAP_TRACKED_POOLS_V2,
        comparator: UniswapV2DataComparator.compare,
        minBlockNumber: 221_586,
        sourceA: {
            url: "https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v2",
            query: UNISWAP_V2_QUERY,
        },
        sourceB: {
            url: "http://localhost:4350/graphql",
            query: LOCAL_V2_QUERY,
        }
    },
    {
        name: "Stellaswap V2 Price Data",
        dexType: DexType.STELLASWAP_V2,
        pools: STELLASWAP_TRACKED_POOLS_V2,
        comparator: UniswapV2DataComparator.compare,
        minBlockNumber: 0,
        sourceA: {
            url: "https://analytics.stellaswap.com/api/graphql/v2",
            query: UNISWAP_V2_QUERY,
        },
        sourceB: {
            url: "http://localhost:4350/graphql",
            query: LOCAL_V2_QUERY,
        }
    },

];

export const configsV3: GraphqlComparisonConfig[] = [
    {
        name: "Beamswap V3 Price Data",
        dexType: DexType.BEAMSWAP_V3,
        pools: BEAMSWAP_TRACKED_POOLS_V3,
        comparator: UniswapV3DataComparator.compare,
        minBlockNumber: 3_579_832,
        sourceA: {
            url: "https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v3/",
            query: BEAMSWAP_V3_QUERY,
        },
        sourceB: {
            url: "http://localhost:4350/graphql",
            query: LOCAL_V3_QUERY,
        }
    },
    {
        name: "Stellaswap V3 Price Data",
        dexType: DexType.STELLASWAP_V3,
        pools: STELLASWAP_TRACKED_POOLS_V3,
        comparator: UniswapV3DataComparator.compare,
        //        minBlockNumber: 0,
        sourceA: {
            url: "https://analytics.stellaswap.com/api/graphql/v3",
            query: STELLASWAP_V3_QUERY,
        },
        sourceB: {
            url: "http://localhost:4350/graphql",
            query: LOCAL_V3_QUERY,
        }
    },

];


export const configsV4: GraphqlComparisonConfig[] = [
    {
        name: "Stellaswap V4 Price Data",
        dexType: DexType.STELLASWAP_V4,
        pools: STELLASWAP_TRACKED_POOLS_V4,
        comparator: UniswapV3DataComparator.compare,
        //        minBlockNumber:  ,
        sourceA: {
            url: "https://thegraph.com/explorer/api/playground/Qmbnsdx4euoZmBiX7UV4enssQNtKwJ3yAGRL2Z9Mca1DJu",
            query: STELLASWAP_V3_QUERY,
        },
        sourceB: {
            url: "http://localhost:4350/graphql",
            query: LOCAL_V4_QUERY,
        }
    },
];
