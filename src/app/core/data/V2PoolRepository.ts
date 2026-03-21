import { IgnoreCaseMap } from '@app/core/trackedPools/trackedPoolsTypes'
import { DexType, V2Pool, V2PoolSnapshot } from '@model/generated'
import { BigDecimal } from '@subsquid/big-decimal'
import { EntityManager } from 'typeorm'

export type IV2PoolsData = {
    poolsMap: IgnoreCaseMap<V2Pool>;
    snapshotMap: IgnoreCaseMap<V2PoolSnapshot>;
}

export class V2PoolRepository {

    constructor(private readonly em: EntityManager) { }

    async loadPoolsData(dexType: DexType): Promise<IV2PoolsData> {
        const poolsMap: IgnoreCaseMap<V2Pool> = await this._loadPoolsMap(dexType);
        const snapshotMap: IgnoreCaseMap<V2PoolSnapshot> = await this._loadLatestSnapshots(dexType);

        Array.from(snapshotMap.values()).forEach((snapshot: V2PoolSnapshot) => {
            const pool = poolsMap.get(snapshot.pool!.id)
            snapshot.pool = pool
        });

        return {
            poolsMap,
            snapshotMap
        };
    }

    private async _loadPoolsMap(dexType: DexType): Promise<IgnoreCaseMap<V2Pool>> {
        const poolsMap: IgnoreCaseMap<V2Pool> = new IgnoreCaseMap()
        const pools: V2Pool[] = await this.em.find(V2Pool, {
            relations: {
                token0: true,
                token1: true,
            },
            where: {
                dex: dexType
            }
        });

        pools.forEach((pool: V2Pool) => poolsMap.set(pool.id, pool))
        return poolsMap
    }

    private async _loadLatestSnapshots(dexType: DexType): Promise<IgnoreCaseMap<V2PoolSnapshot>> {
        const snapshotMap: IgnoreCaseMap<V2PoolSnapshot> = new IgnoreCaseMap()
        const result = await this.em.query(this._getLatestPoolsPricesQuery(dexType))

        for (const row of result) {
            const snapshot = this._mapSnapshot(row)
            snapshotMap.set(row.pool_id, snapshot)
        }

        return snapshotMap
    }

    private _mapSnapshot(row: any): V2PoolSnapshot {
        const priorityFee = !!row.priority_inclusion_fee_per_unit
            ? BigInt(row.priority_inclusion_fee_per_unit) : null;

        return new V2PoolSnapshot({
            id: row.id,
            pool: { id: row.pool_id } as any,
            blockNumber: Number(row.block_number),
            afterTxId: row.after_tx_id,
            priorityInclusionFeePerUnit: priorityFee,
            index: row.index,
            reserve0: BigDecimal(row.reserve0),
            reserve1: BigDecimal(row.reserve1),
            token0Price: BigDecimal(row.token0_price),
            token1Price: BigDecimal(row.token1_price),
        })
    }

    private _getLatestPoolsPricesQuery(dexType: DexType): string {
        return `
            SELECT v2_pool_snapshot.* FROM v2_pool_snapshot
            INNER JOIN v2_pool ON v2_pool_snapshot.pool_id = v2_pool.id
            WHERE v2_pool.dex = '${dexType}'
              AND v2_pool_snapshot.after_tx_id IS NULL
              AND v2_pool_snapshot.block_number = (
                  SELECT MAX(block_number)
                  FROM v2_pool_snapshot
                  WHERE pool_id = v2_pool.id
              )
        `
    }
}
