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
        ...BEAMSWAP_TRACKED_POOLS_V2.map((pool) => new V2Pool({
            id: pool.id,
            createdAtBlockNumber: 0,
            token0: TokensRepository._toDbToken(pool.token0),
            token1: TokensRepository._toDbToken(pool.token1),
            createdAt: new Date(),
            dex: DexType.BEAMSWAP_V2,
        })),
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
        ...BEAMSWAP_TRACKED_POOLS_V3.map((pool) => new V3Pool({
            id: pool.id,
            createdAt: new Date(),
            createdAtBlockNumber: 0,
            token0: TokensRepository._toDbToken(pool.token0),
            token1: TokensRepository._toDbToken(pool.token1),
            dex: DexType.BEAMSWAP_V3,
            feeTier: BigInt(0),
        })),
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
        var v2Pools = generateV2Pools()
            .filter((pool) =>
                pool.id !== "0x7f5ac0fc127bcf1eaf54e3cd01b00300a0861a62" &&
                pool.id !== "0x555b74dafc4ef3a5a1640041e3244460dc7610d1" &&
                pool.id !== "0x81e11a9374033d11cc7e7485a7192ae37d0795d6"
            );
        var v3Pools = generateV3Pools()
            .filter((pool) =>
                pool.id !== "0xf7e2f39624aad83ad235a090be89b5fa861c29b8" &&
                pool.id !== "0x3ecb97dae88c33717ce92596a593b41556a2ebc0" &&
                pool.id !== "0xb13b281503f6ec8a837ae1a21e86a9cae368fcc5" &&
                pool.id !== "0x5daf7f80cc550ee6249a4635c3bb0678e94d3867" &&
                pool.id !== "0x7e71d586ad01c0bf7953eb82e7b76c1338b0068c"
            );

        var v4Pools = generateV4Pools()
            .filter((pool) =>
                pool.id !== "0x8b86404faa0269fc18c6abb091e551454b29bc30" &&
                pool.id !== "0x2cc4c3a48432f5bc5ad8c449ff0910e0531b7f1f" &&
                pool.id !== "0xc295aa4287127c5776ad7031648692659ef2cebb" &&
                pool.id !== "0x921b35e54b45b60ee8142fa234baeb2ff5e307e0" &&
                pool.id !== "0xac25c73589b3c67e83c72279e122e71f49a329d6" &&

                pool.id !== "0x71785b1a85b158ef7b59ef4c0feb72430cc3de12" &&
                pool.id !== "0x28137d36ad945b0c1b35f2bf90cfe6ff6cb87511" &&
                pool.id !== "0x07f2ec33ffc1190271f83c9c93636a63c513cbb4"
            );

        await ctx.store.insert(v2Pools);
        logger.info("**Finished import of V2 pools, count: " + v2Pools.length);

        await ctx.store.insert(v3Pools);
        logger.info("**Finished import of V3 pools, count: " + v3Pools.length);

        await ctx.store.insert(v4Pools);
        logger.info("**Finished import of V4 pools, count: " + v4Pools.length);

        logger.info("**Finished import of all pools, total count: " + (v2Pools.length + v3Pools.length + v4Pools.length));

    });
}
