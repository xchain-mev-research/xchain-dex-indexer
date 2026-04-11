import { DexConfig, IDexConfig } from "@app/core/config/DexConfig";
import { Parachain, ParachainInfo } from '@app/core/parachainUtils/ParachainConst';
import { BEAMSWAP_V3_QUERY, STELLASWAP_V3_QUERY, UNISWAP_V2_QUERY } from "@app/core/dataIntegrityTest/support/officialSubgraphQueries";

import * as v2FactoryAbi from 'src/abi/v2Dexes/factory/v2Factory';
import * as v2PoolAbi from '@abi/v2Dexes/pair/v2Pair';

import * as algebraFactoryAbi from 'src/abi/v3Dexes/algebra/factory/v3AlgebraFactory';
import * as algebraPoolAbi from 'src/abi/v3Dexes/algebra/pool/v3AlgebraPool';

import * as v3FactoryAbi from 'src/abi/v3Dexes/uniswap/factory/v3UniswapFactory';
import * as v3PoolAbi from 'src/abi/v3Dexes/uniswap/pool/v3UniswapPool';

import * as v4FactoryAbi from '@abi/v4Dexes/algebra/factory/v4AlgebraFactory';
import * as v4PoolAbi from '@abi/v4Dexes/algebra/pool/v4AlgebraPool';

import { STELLASWAP_TRACKED_POOLS_V2 } from '@app/chains/moonbeam/trackedItems/pools/generated/stellaswap/StellaswapTrackedPoolsV2';
import { STELLASWAP_TRACKED_POOLS_V3 } from "@app/chains/moonbeam/trackedItems/pools/generated/stellaswap/StellaswapTrackedPoolsV3";
import { BEAMSWAP_TRACKED_POOLS_V2 } from '@app/chains/moonbeam/trackedItems/pools/static/beamswap/BeamswapTrackedPoolsV2';
import { BEAMSWAP_TRACKED_POOLS_V3 } from "@app/chains/moonbeam/trackedItems/pools/static/beamswap/BeamswapTrackedPoolsV3";
import { BEAMSWAP_TRACKED_STABLE_POOLS } from "@app/chains/moonbeam/trackedItems/pools/static/beamswap/BeamswapTrackedStablePools";
import { DexType } from "@model/generated";
import { STELLASWAP_TRACKED_POOLS_V4 } from "../trackedItems/pools/static/stellaswap/StellaswapTrackedPoolsV4";
import { STELLASWAP_TRACKED_STABLE_POOLS } from "../trackedItems/pools/static/stellaswap/StellaswapTrackedStablePools";

const MOONBEAM: ParachainInfo = Parachain.Moonbeam;

export class MoonbeamDexConfigRegistry {

    static registerAllConfigs(
        dexConfigMap: Map<DexType, Map<string, DexConfig>>,
        factoriesMap: Map<string, Map<string, null>>
    ) {

        const store = (config: IDexConfig) => {
            if (!dexConfigMap.has(config.dexType)) {
                dexConfigMap.set(config.dexType, new Map());
            }

            dexConfigMap.get(config.dexType)?.set(config.chain.name, new DexConfig(config));

            const chainFactories = factoriesMap.get(config.chain.name) ?? new Map();
            chainFactories.set(config.factoryAddress!.toLowerCase(), null);

            factoriesMap.set(config.chain.name, chainFactories);
        };

        // ----- V2 ------

        store({
            dexType: DexType.STELLASWAP_V2,
            factoryAddress: "0x68A384D826D3678f78BB9FB1533c7E9577dACc0E",
            factoryAddressCreatedAt: 173_814,
            trackedPools: new Map(STELLASWAP_TRACKED_POOLS_V2.map(p => [p.id, null])),
            factoryAbi: v2FactoryAbi,
            poolAbi: v2PoolAbi,
            chain: MOONBEAM,
            bootstrapConfig: {
                subgraphUrl: "https://analytics.stellaswap.com/api/graphql/v2",
                subgraphQuery: UNISWAP_V2_QUERY,
            },
        });

        store({
            dexType: DexType.BEAMSWAP_V2,
            factoryAddress: "0x985BcA32293A7A496300a48081947321177a86FD",
            factoryAddressCreatedAt: 199_156,
            trackedPools: new Map(BEAMSWAP_TRACKED_POOLS_V2.map(p => [p.id, null])),
            factoryAbi: v2FactoryAbi,
            poolAbi: v2PoolAbi,
            chain: MOONBEAM,
            bootstrapConfig: {
                subgraphUrl: "https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v2",
                subgraphQuery: UNISWAP_V2_QUERY,
            },
        });

        // END ----- V2 ------

        // ----- V3 ------

        store({
            dexType: DexType.STELLASWAP_V3,
            factoryAddress: "0xabE1655110112D0E45EF91e94f8d757e4ddBA59C",
            factoryAddressCreatedAt: 2_649_801,
            trackedPools: new Map(STELLASWAP_TRACKED_POOLS_V3.map(p => [p.id, null])),
            factoryAbi: algebraFactoryAbi,
            poolAbi: algebraPoolAbi,
            chain: MOONBEAM,
            intraBlockSnapshots: true,
            bootstrapConfig: {
                subgraphUrl: "https://analytics.stellaswap.com/api/graphql/v3",
                subgraphQuery: STELLASWAP_V3_QUERY,
                isAlgebraFee: true,
            },
        });

        store({
            dexType: DexType.BEAMSWAP_V3,
            factoryAddress: "0xD118fa707147c54387B738F54838Ea5dD4196E71",
            factoryAddressCreatedAt: 3_579_833,
            trackedPools: new Map(BEAMSWAP_TRACKED_POOLS_V3.map(p => [p.id, null])),
            factoryAbi: v3FactoryAbi,
            poolAbi: v3PoolAbi,
            chain: MOONBEAM,
            bootstrapConfig: {
                subgraphUrl: "https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v3/",
                subgraphQuery: BEAMSWAP_V3_QUERY,
                isAlgebraFee: false,
            },
        });

        // END ----- V3 ------

        // --------- V4 ------
        store({
            dexType: DexType.STELLASWAP_V4,
            factoryAddress: "0x90dD87C994959A36d725bB98F9008B0b3C3504A0",
            factoryAddressCreatedAt: 9_521_226,
            trackedPools: new Map(STELLASWAP_TRACKED_POOLS_V4.map(p => [p.id, null])),
            factoryAbi: v4FactoryAbi,
            poolAbi: v4PoolAbi,
            chain: MOONBEAM,
            bootstrapConfig: {
                subgraphUrl: "https://thegraph.com/explorer/api/playground/Qmbnsdx4euoZmBiX7UV4enssQNtKwJ3yAGRL2Z9Mca1DJu",
                subgraphQuery: STELLASWAP_V3_QUERY, // V4 subgraph uses the same pool/tick shape
                isAlgebraFee: true,
            },
        });

        // END ----- V4 ------


        // ----- STABLE POOLs ------

        store({
            dexType: DexType.STELLASWAP_STABLE_AMM,
            factoryAddress: "null",
            factoryAddressCreatedAt: undefined,
            trackedPools: new Map(STELLASWAP_TRACKED_STABLE_POOLS.map(p => [p.id, null])),
            factoryAbi: null,
            poolAbi: null,
            chain: MOONBEAM
        });

        store({
            dexType: DexType.BEAMSWAP_STABLE_AMM,
            factoryAddress: "null",
            factoryAddressCreatedAt: undefined,
            trackedPools: new Map(BEAMSWAP_TRACKED_STABLE_POOLS.map(p => [p.id, null])),
            factoryAbi: null,
            poolAbi: null,
            chain: MOONBEAM
        });

        // END ----- STABLE POOLs ------
    }
}
