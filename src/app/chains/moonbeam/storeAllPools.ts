import { TokensRepository } from '@app/core/data/TokensRepository';
import { OnceIndexer } from '@app/core/indexingEngine/onceIndexer/OnceIndexer';
import { logger } from "@app/core/log/logger";
import { STELLASWAP_TRACKED_POOLS_V2 } from './trackedItems/pools/generated/stellaswap/StellaswapTrackedPoolsV2';
import { STELLASWAP_TRACKED_POOLS_V3 } from './trackedItems/pools/generated/stellaswap/StellaswapTrackedPoolsV3';
import { BEAMSWAP_TRACKED_POOLS_V2 } from './trackedItems/pools/static/beamswap/BeamswapTrackedPoolsV2';
import { BEAMSWAP_TRACKED_POOLS_V3 } from './trackedItems/pools/static/beamswap/BeamswapTrackedPoolsV3';
import { STELLASWAP_TRACKED_POOLS_V4 } from './trackedItems/pools/static/stellaswap/StellaswapTrackedPoolsV4';
import { DexType, V2Pool, V3Pool, V4Pool } from '@model/generated';

export function generateV2Pools(): V2Pool[] {

    return [
        // ...BEAMSWAP_TRACKED_POOLS_V2.map((pool) => new V2Pool({
        //     id: pool.id,
        //     createdAtBlockNumber: 0,
        //     token0: TokensRepository._toDbToken(pool.token0),
        //     token1: TokensRepository._toDbToken(pool.token1),
        //     createdAt: new Date(),
        //     dex: DexType.BEAMSWAP_V2,
        // })),
        ...STELLASWAP_TRACKED_POOLS_V2.map((pool) => new V2Pool({
            id: pool.id,
            createdAt: new Date(),
            createdAtBlockNumber: 0,
            token0: TokensRepository._toDbToken(pool.token0),
            token1: TokensRepository._toDbToken(pool.token1),
            dex: DexType.STELLASWAP_V2,
        })),

    ];
}

export function generateV3Pools(): V3Pool[] {

    return [
        // ...BEAMSWAP_TRACKED_POOLS_V3.map((pool) => new V3Pool({
        //     id: pool.id,
        //     createdAt: new Date(),
        //     createdAtBlockNumber: 0,
        //     token0: TokensRepository._toDbToken(pool.token0),
        //     token1: TokensRepository._toDbToken(pool.token1),
        //     dex: DexType.BEAMSWAP_V3,
        //     feeTier: BigInt(0),
        // })),
        ...STELLASWAP_TRACKED_POOLS_V3.map((pool) => new V3Pool({
            id: pool.id,
            createdAt: new Date(),
            createdAtBlockNumber: 0,
            token0: TokensRepository._toDbToken(pool.token0),
            token1: TokensRepository._toDbToken(pool.token1),
            dex: DexType.STELLASWAP_V3,
            feeTier: BigInt(0),
        })),
    ];
}

export function generateV4Pools(): V4Pool[] {

    return [
        ...STELLASWAP_TRACKED_POOLS_V4.map((pool) => new V4Pool({
            id: pool.id,
            createdAt: new Date(),
            createdAtBlockNumber: 0,
            token0: TokensRepository._toDbToken(pool.token0),
            token1: TokensRepository._toDbToken(pool.token1),
            dex: DexType.STELLASWAP_V4,
            feeTier: BigInt(0),
        })),
    ];
}

export function storeAllPools(): void {
    OnceIndexer.startImport("storeAllPools", async ctx => {
        var v2Pools = generateV2Pools();
        var v3Pools = generateV3Pools();
        var v4Pools = generateV4Pools();

        await ctx.store.insert(v2Pools);
        logger.info("**Finished import of V2 pools, count: " + v2Pools.length);

        await ctx.store.insert(v3Pools);
        logger.info("**Finished import of V3 pools, count: " + v3Pools.length);

        await ctx.store.insert(v4Pools);
        logger.info("**Finished import of V4 pools, count: " + v4Pools.length);

        logger.info("**Finished import of all pools, total count: " + (v2Pools.length + v3Pools.length + v4Pools.length));

    });
}

storeAllPools();