import { logger } from "@app/core/log/logger";
import { ConverterUtils } from "@app/core/utils/ConverterUtils";
import { BEAMSWAP_TRACKED_STABLE_POOLS } from "@app/chains/moonbeam/trackedItems/pools/static/beamswap/BeamswapTrackedStablePools";
import { DexType, StablePool, StablePoolCoin, Token } from "@model/generated";
import { DataHandlerContext } from "@subsquid/evm-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { ITrackedStablePool, ITrackedToken } from '../../trackedPools/trackedPoolsTypes';
import { createOnceProcessor } from './onceProcessor';
import { TokensRepository as TokenRepository } from "@app/core/data/TokensRepository";
import { STELLASWAP_TRACKED_STABLE_POOLS } from "@app/chains/moonbeam/trackedItems/pools/static/stellaswap/StellaswapTrackedStablePools";


type Context = DataHandlerContext<Store, {
    log: {
        topics: true;
        data: true;
        address: true;
    };
    transaction: {
        hash: true;
    };
}>;

export abstract class OnceIndexer {


    constructor() {
    }

    static startImport(schema: string = "onceImporterSchema", processFn: (ctx: Context) => Promise<void>) {

        createOnceProcessor().run(new TypeormDatabase({ stateSchema: schema })
            , async ctx => {
                await processFn(ctx)
            });
    }

    protected abstract process(ctx: Context): Promise<void>;

    startImport() {
        OnceIndexer.startImport(undefined, this.process.bind(this));
    }

}

export class StablePoolsImporter extends OnceIndexer {

    private tokensMap!: Map<string, Token>;

    constructor() {
        super();
    }

    protected async process(ctx: Context): Promise<void> {
        logger.info("*** StablePoolsImporter - process");

        this.tokensMap = await TokenRepository.loadTokensMap(ctx)

        var pools: StablePool[] = [];

        STELLASWAP_TRACKED_STABLE_POOLS.forEach(iPool => {
            var pool = this.createStablePool(iPool, DexType.STELLASWAP_STABLE_AMM);
            pools.push(pool);
        })

        BEAMSWAP_TRACKED_STABLE_POOLS.forEach(iPool => {
            var pool = this.createStablePool(iPool, DexType.BEAMSWAP_STABLE_AMM);
            pools.push(pool);
        })

        await ctx.store.insert(pools);

        var coinsToInsert: StablePoolCoin[] = [];
        pools.forEach(pool => {
            coinsToInsert.push(...pool.coins);
        })

        await ctx.store.insert(coinsToInsert);
    }

    createStablePool(iPool: ITrackedStablePool, dexType: DexType): StablePool {
        var poolEntity = new StablePool({
            id: iPool.id,
            createdAtBlockNumber: iPool.createdAtBlockNumber,
            createdAt: ConverterUtils.timestampToDate(Number(iPool.createdAtTimestamp)),

            coinCount: iPool.tokens.length,

            dex: dexType,
        });

        poolEntity.coins = this.iTokensToEntityCoins(poolEntity, iPool.tokens)

        return poolEntity;
    }


    iTokensToEntityCoins(pool: StablePool, tokens: ITrackedToken[]): StablePoolCoin[] {
        var result: StablePoolCoin[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const tokenEntity = this.tokensMap.get(tokens[i].id);
            var coinEntity = new StablePoolCoin({
                id: pool.id + "-" + i,
                index: i,
                token: tokenEntity,
                pool: pool
            });
            result.push(coinEntity);
        }

        return result;
    }
}
