import { DexType, Token, V2Pool, V2PoolSnapshot } from '@model/generated';
import { BigDecimal } from '@subsquid/big-decimal';
import { EntityManager } from 'typeorm';
import { graphqlRequest } from '@app/core/graphql/graphqlRequest';
import { logger } from '@app/core/log/logger';
import { ISnapshotBootstrapConfig } from './SnapshotBootstrapConfig';

export class V2SnapshotBootstrapper {

    constructor(
        private readonly config: ISnapshotBootstrapConfig,
        private readonly dexType: DexType,
        private readonly poolIds: string[],
    ) { }

    async run(bootstrapBlock: number, em: EntityManager): Promise<void> {
        const response = await graphqlRequest(
            this.config.subgraphUrl,
            this.config.subgraphQuery,
            { blockNumber: bootstrapBlock, idList: this.poolIds },
        );

        // Official V2 subgraphs return root key "pairs"
        const pairs: any[] = response?.data?.pairs;
        if (!pairs || pairs.length === 0) {
            logger.warn(`[Bootstrap V2][${this.dexType}] No pairs returned at block ${bootstrapBlock}`);
            return;
        }

        await this._upsertTokens(pairs, em);
        await this._upsertPools(pairs, bootstrapBlock, em);
        await this._insertSnapshots(pairs, bootstrapBlock, em);

        logger.info(`[Bootstrap V2][${this.dexType}] Bootstrapped ${pairs.length} snapshots at block ${bootstrapBlock}`);
    }

    // -------- private helpers --------

    private async _upsertTokens(pairs: any[], em: EntityManager): Promise<void> {
        const tokenMap = new Map<string, Token>();

        for (const pair of pairs) {
            for (const raw of [pair.token0, pair.token1]) {
                const id = raw.id.toLowerCase();
                if (!tokenMap.has(id)) {
                    tokenMap.set(id, new Token({
                        id,
                        symbol: raw.symbol,
                        name: raw.name,
                        decimals: Number(raw.decimals),
                    }));
                }
            }
        }

        if (tokenMap.size === 0) return;

        await em.createQueryBuilder()
            .insert()
            .into(Token)
            .values(Array.from(tokenMap.values()))
            .orIgnore()
            .execute();
    }

    private async _upsertPools(pairs: any[], bootstrapBlock: number, em: EntityManager): Promise<void> {
        const pools = pairs.map(pair => new V2Pool({
            id: pair.id.toLowerCase(),
            createdAtBlockNumber: bootstrapBlock,
            createdAt: null,
            // Use partial references — TypeORM resolves FKs by id
            token0: { id: pair.token0.id.toLowerCase() } as Token,
            token1: { id: pair.token1.id.toLowerCase() } as Token,
            dex: this.dexType,
        }));

        await em.createQueryBuilder()
            .insert()
            .into(V2Pool)
            .values(pools)
            .orIgnore()
            .execute();
    }

    private async _insertSnapshots(pairs: any[], bootstrapBlock: number, em: EntityManager): Promise<void> {
        const snapshots = pairs.map(pair => {
            const poolId = pair.id.toLowerCase();
            return new V2PoolSnapshot({
                id: `${poolId}-${bootstrapBlock}-end`,
                pool: { id: poolId } as V2Pool,
                blockNumber: bootstrapBlock,
                afterTxId: null,
                index: null,
                priorityInclusionFeePerUnit: null,
                reserve0: BigDecimal(pair.reserve0),
                reserve1: BigDecimal(pair.reserve1),
                token0Price: BigDecimal(pair.token0Price),
                token1Price: BigDecimal(pair.token1Price),
            });
        });

        await em.createQueryBuilder()
            .insert()
            .into(V2PoolSnapshot)
            .values(snapshots)
            .orIgnore()
            .execute();
    }
}
