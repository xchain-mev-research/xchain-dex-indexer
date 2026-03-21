import { V3MathUtils } from '@app/core/utils/V3MathUtils';
import { DexType, V3PoolSnapshot, V3PoolSnapshotTick, V4PoolSnapshot, V4PoolSnapshotTick } from '@model/generated';
import { BigDecimal } from '@subsquid/big-decimal';
import { Log } from '@subsquid/evm-processor';

export class UniswapV3ImporterUtils {

    // ------------------- Ticks -------------------

    static newTickId(poolSnapshotId: string, tickIdx: number | bigint): string {
        return `${poolSnapshotId}#${tickIdx.toString()}`;
    }

    static updateTickIds(poolSnapshot: V3PoolSnapshot): void {
        for (const tick of poolSnapshot.ticks) {
            tick.id = UniswapV3ImporterUtils.newTickId(poolSnapshot.id, tick.tickIdx);
            tick.poolSnapshot = poolSnapshot;
        }
    }

    static createTick(tickId: string, tickIdx: number, poolSnapshot: V3PoolSnapshot): V3PoolSnapshotTick {

        var tick: V3PoolSnapshotTick = new V3PoolSnapshotTick({
            id: tickId,
            poolSnapshot,

            tickIdx: BigInt(tickIdx),
            liquidityGross: V3MathUtils.ZERO_BI,
            liquidityNet: V3MathUtils.ZERO_BI,
        });

        return tick
    }
    static createTickV4(tickId: string, tickIdx: number, poolSnapshot: V4PoolSnapshot): V4PoolSnapshotTick {
        var tick: V4PoolSnapshotTick = new V4PoolSnapshotTick({
            id: tickId,
            poolSnapshot,

            tickIdx: BigInt(tickIdx),
            liquidityGross: V3MathUtils.ZERO_BI,
            liquidityNet: V3MathUtils.ZERO_BI,
        });

        return tick
    }

    static async findTickById(ctx: any, id: string): Promise<V3PoolSnapshotTick | null> {
        return await ctx.store.findOne(V3PoolSnapshotTick, { where: { id: id } });
    }

    static copyTicks(ticks: V3PoolSnapshotTick[]): V3PoolSnapshotTick[] {
        return ticks?.map(t => new V3PoolSnapshotTick({ ...t })) ?? [];
    }
    static copyTicksV4(ticks: V4PoolSnapshotTick[]): V4PoolSnapshotTick[] {
        return ticks?.map(t => new V4PoolSnapshotTick({ ...t })) ?? [];
    }
    // END --------------- Ticks -------------------

    static newPoolSnapshotId(log: Log): string {
        const txIndex = log.getTransaction().transactionIndex.toString();
        return `${log.address}-${log.block.height}-${txIndex}`;
    }

    static newEndBlockId(pool: { id: string }, blockNumber: number): string {
        return `${pool.id}-${blockNumber}-end`;
    }

    static createTickEntities(poolSnapshot: V3PoolSnapshot): V3PoolSnapshotTick[] {
        const ticks = poolSnapshot.ticks;
        if (!ticks)
            return [];

        return ticks.map(t => {
            var tick = new V3PoolSnapshotTick(t);
            tick.poolSnapshot = poolSnapshot;
            return tick;
        });
    }

    static createTickEntitiesV4(poolSnapshot: V4PoolSnapshot): V4PoolSnapshotTick[] {
        const ticks = poolSnapshot.ticks;
        if (!ticks)
            return [];

        return ticks.map(t => {
            var tick = new V4PoolSnapshotTick(t);
            tick.poolSnapshot = poolSnapshot;
            return tick;
        });

    }
}
