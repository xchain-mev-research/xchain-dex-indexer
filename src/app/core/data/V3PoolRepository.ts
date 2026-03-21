import { EntityManager } from 'typeorm'
import { BigDecimal } from '@subsquid/big-decimal'
import { DexType, V3Pool, V3PoolSnapshot, V3PoolSnapshotTick } from '@model/generated'
import { IgnoreCaseMap } from '@app/core/trackedPools/trackedPoolsTypes'

export type IV3PoolsData = {
    poolsMap: IgnoreCaseMap<V3Pool>;
    snapshotMap: IgnoreCaseMap<V3PoolSnapshot>;
}

export class V3PoolRepository {

    constructor(private readonly em: EntityManager) { }

    async loadPoolsData(dexType: DexType): Promise<IV3PoolsData> {
        const poolsMap: IgnoreCaseMap<V3Pool> = await this._loadPoolsMap(dexType);
        const snapshotMap: IgnoreCaseMap<V3PoolSnapshot> = await this._loadLatestSnapshots(dexType);

        Array.from(snapshotMap.values()).forEach((snapshot: V3PoolSnapshot) => {
            const pool = poolsMap.get(snapshot.pool.id)
            snapshot.pool = pool
        });

        return {
            poolsMap,
            snapshotMap
        };
    }

    private async _loadPoolsMap(dexType: DexType): Promise<IgnoreCaseMap<V3Pool>> {
        const poolsMap: IgnoreCaseMap<V3Pool> = new IgnoreCaseMap()
        const pools: V3Pool[] = await this.em.find(V3Pool, {
            relations: {
                token0: true,
                token1: true,
            },

            where: {
                dex: dexType
            }
        });

        pools.forEach((pool: any) => poolsMap.set(pool.id, pool))
        return poolsMap
    }

    private async _loadLatestSnapshots(dexType: string): Promise<IgnoreCaseMap<V3PoolSnapshot>> {
        const snapshotMap: IgnoreCaseMap<V3PoolSnapshot> = new IgnoreCaseMap()
        const result = await this.em.query(this._getLatestPoolsPricesQuery(dexType))

        for (const row of result) {
            const snapshot = await this._mapSnapshot(row)
            snapshotMap.set(row.pool_id, snapshot)
        }

        return snapshotMap
    }

    private async _mapSnapshot(row: any): Promise<V3PoolSnapshot> {
        const priorityFee = !!row.priority_inclusion_fee_per_unit
            ? BigInt(row.priority_inclusion_fee_per_unit) : null;

        const snapshot = new V3PoolSnapshot({
            id: row.id,
            pool: { id: row.pool_id } as any,
            blockNumber: Number(row.block_number),
            afterTxId: row.after_tx_id,
            priorityInclusionFeePerUnit: priorityFee,
            index: row.index,
            fee: row.fee ? BigInt(row.fee) : undefined,
            liquidity: BigInt(row.liquidity),
            sqrtPrice: BigInt(row.sqrt_price),
            tick: row.tick !== null ? Number(row.tick) : null,
            token0Price: BigDecimal(row.token0_price),
            token1Price: BigDecimal(row.token1_price),
            ticks: await this._loadSnapshotTicks(row.id)
        })

        snapshot.ticks.forEach((tick: V3PoolSnapshotTick) => {
            tick.poolSnapshot = snapshot
        });

        return snapshot;
    }

    private async _loadSnapshotTicks(snapshotId: string): Promise<V3PoolSnapshotTick[]> {
        const ticks = await this.em.query(
            `SELECT * FROM v3_pool_snapshot_tick WHERE pool_snapshot_id = $1`,
            [snapshotId]
        )

        return ticks.map((tick: any) => ({
            id: tick.id,
            poolSnapshot: null,
            tickIdx: BigInt(tick.tick_idx),
            liquidityGross: BigInt(tick.liquidity_gross),
            liquidityNet: BigInt(tick.liquidity_net),
        }))
    }

    private _getLatestPoolsPricesQuery(dexType: string): string {
        return `
            SELECT v3_pool_snapshot.* FROM v3_pool_snapshot
            INNER JOIN v3_pool ON v3_pool_snapshot.pool_id = v3_pool.id
            WHERE v3_pool.dex = '${dexType}'
              AND v3_pool_snapshot.after_tx_id IS NULL
              AND v3_pool_snapshot.block_number = (
                  SELECT MAX(block_number)
                  FROM v3_pool_snapshot
                  WHERE pool_id = v3_pool.id
              )
        `
    }
}
