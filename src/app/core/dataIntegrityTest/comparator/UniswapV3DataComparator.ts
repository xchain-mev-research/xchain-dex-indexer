import { ITrackedToken } from '@app/core/trackedPools/trackedPoolsTypes';
import { BigDecimal } from "@subsquid/big-decimal";
import { DataIntegrityUtils } from "../support/DataIntegrityUtils";
import { V3PoolSnapshot, V3PoolSnapshotTick, V4PoolSnapshot, V4PoolSnapshotTick } from '@model/generated';
import { logger } from '@app/core/log/logger';

interface OfficialV3Tick {
    tickIdx: string; // BigInt as string
    liquidityGross: string;
    liquidityNet: string;
}

interface OfficialV3Price {
    id: string;
    token0: ITrackedToken;
    token1: ITrackedToken;

    token0Price: string;
    token1Price: string;

    liquidity: string; // BigInt as string
    sqrtPrice: string; // BigInt as string

    tick?: number;
    fee?: string; // optional, BigInt as string

    ticks?: OfficialV3Tick[];
}

export class UniswapV3DataComparator {

    static compare(itemA: OfficialV3Price, itemB: V3PoolSnapshot | V4PoolSnapshot): boolean {
        if (!itemA || !itemB) return false;

        if (itemA.id !== itemB.pool.id) return false;

        if (DataIntegrityUtils.mismatchTokens(itemA.token0, itemB.pool.token0))
            return false;
        if (DataIntegrityUtils.mismatchTokens(itemA.token1, itemB.pool.token1))
            return false;

        if (itemA.token0Price == "0" || itemA.token1Price == "0") {
            logger.warn(`UniswapV3DataComparator.compare: token0Price or token1Price is zero for pool ${itemA.id}`);
        }

        if (itemA.token0Price != "0" && DataIntegrityUtils.mismatchBigDecimals(itemA.token0Price, itemB.token0Price))
            return false;
        if (itemA.token1Price != "0" && DataIntegrityUtils.mismatchBigDecimals(itemA.token1Price, itemB.token1Price))
            return false;

        if (itemA.liquidity !== itemB.liquidity.toString())
            return false;
        if (itemA.sqrtPrice !== itemB.sqrtPrice.toString())
            return false;

        if (itemA.tick !== undefined && itemB.tick !== null) {
            if (itemA.tick != itemB.tick)
                return false;
        }

        if (
            itemA.fee != itemB.pool.feeTier?.toString()
            &&
            itemA.fee != itemB.fee?.toString()
        )
            return false;

        // Tick comparison
        if (itemA.ticks && itemB.ticks) {
            const sortedA = [...itemA.ticks].sort((a, b) => Number(a.tickIdx) - Number(b.tickIdx));
            const sortedB = [...itemB.ticks].sort((a, b) => BigInt(a.tickIdx) < BigInt(b.tickIdx) ? -1 : 1);

            if (sortedA.length !== sortedB.length)
                return false;

            for (let i = 0; i < sortedA.length; i++) {
                const tickA = sortedA[i];
                const tickB: V3PoolSnapshotTick | V4PoolSnapshotTick = sortedB[i];

                if (tickA.tickIdx !== tickB.tickIdx.toString()) return false;
                if (tickA.liquidityGross !== tickB.liquidityGross.toString()) return false;
                if (tickA.liquidityNet !== tickB.liquidityNet.toString()) return false;
            }
        }

        return true;
    }
}
