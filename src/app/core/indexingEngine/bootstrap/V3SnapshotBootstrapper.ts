import { DexType, Token, V3Pool, V3PoolSnapshot, V3PoolSnapshotTick } from '@model/generated';
import { BigDecimal } from '@subsquid/big-decimal';
import { EntityManager } from 'typeorm';
import { graphqlRequest } from '@app/core/graphql/graphqlRequest';
import { logger } from '@app/core/log/logger';
import { ISnapshotBootstrapConfig } from './SnapshotBootstrapConfig';

export class V3SnapshotBootstrapper {

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

        // Official V3 subgraphs return root key "pools"
        const pools: any[] = response?.data?.pools;
        if (!pools || pools.length === 0) {
            logger.warn(`[Bootstrap V3][${this.dexType}] No pools returned at block ${bootstrapBlock}`);
            return;
        }

        await this._upsertTokens(pools, em);
        await this._upsertPools(pools, bootstrapBlock, em);
        const snapshots = await this._insertSnapshots(pools, bootstrapBlock, em);
        await this._insertTicks(snapshots, pools, em);

        logger.info(`[Bootstrap V3][${this.dexType}] Bootstrapped ${snapshots.length} snapshots at block ${bootstrapBlock}`);
    }

    // -------- private helpers --------

    private async _upsertTokens(pools: any[], em: EntityManager): Promise<void> {
        const tokenMap = new Map<string, Token>();

        for (const pool of pools) {
            for (const raw of [pool.token0, pool.token1]) {
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

    private async _upsertPools(pools: any[], bootstrapBlock: number, em: EntityManager): Promise<void> {
        const poolEntities = pools.map(pool => new V3Pool({
            id: pool.id.toLowerCase(),
            createdAtBlockNumber: bootstrapBlock,
            createdAt: new Date(0),
            token0: { id: pool.token0.id.toLowerCase() } as Token,
            token1: { id: pool.token1.id.toLowerCase() } as Token,
            // `fee` field name is consistent across both Uniswap V3 and Algebra queries
            // (Beamswap V3 aliases `feeTier` as `fee` in the query)
            feeTier: BigInt(pool.fee ?? 0),
            dex: this.dexType,
        }));

        await em.createQueryBuilder()
            .insert()
            .into(V3Pool)
            .values(poolEntities)
            .orIgnore()
            .execute();
    }

    private async _insertSnapshots(pools: any[], bootstrapBlock: number, em: EntityManager): Promise<V3PoolSnapshot[]> {
        const snapshots = pools.map(pool => {
            const poolId = pool.id.toLowerCase();
            return new V3PoolSnapshot({
                id: `${poolId}-${bootstrapBlock}-end`,
                pool: { id: poolId } as V3Pool,
                blockNumber: bootstrapBlock,
                afterTxId: null,
                index: null,
                priorityInclusionFeePerUnit: null,
                // For Algebra forks: fee is dynamic per snapshot
                // For Uniswap V3 forks: fee is the static feeTier — stored only on the pool
                fee: this.config.isAlgebraFee && pool.fee != null ? BigInt(pool.fee) : null,
                liquidity: BigInt(pool.liquidity),
                sqrtPrice: BigInt(pool.sqrtPrice),
                tick: pool.tick != null ? Number(pool.tick) : null,
                token0Price: BigDecimal(pool.token0Price),
                token1Price: BigDecimal(pool.token1Price),
                ticks: [],
            });
        });

        await em.createQueryBuilder()
            .insert()
            .into(V3PoolSnapshot)
            .values(snapshots)
            .orIgnore()
            .execute();

        return snapshots;
    }

    private async _insertTicks(snapshots: V3PoolSnapshot[], pools: any[], em: EntityManager): Promise<void> {
        const ticks: V3PoolSnapshotTick[] = [];

        for (let i = 0; i < snapshots.length; i++) {
            const snapshot = snapshots[i];
            const rawTicks: any[] = pools[i].ticks ?? [];

            for (const rawTick of rawTicks) {
                ticks.push(new V3PoolSnapshotTick({
                    id: `${snapshot.id}#${rawTick.tickIdx}`,
                    poolSnapshot: { id: snapshot.id } as V3PoolSnapshot,
                    tickIdx: BigInt(rawTick.tickIdx),
                    liquidityGross: BigInt(rawTick.liquidityGross),
                    liquidityNet: BigInt(rawTick.liquidityNet),
                }));
            }
        }

        if (ticks.length === 0) return;

        await em.createQueryBuilder()
            .insert()
            .into(V3PoolSnapshotTick)
            .values(ticks)
            .orIgnore()
            .execute();
    }
}
