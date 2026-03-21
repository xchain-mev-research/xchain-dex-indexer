import { ITrackedToken } from '@app/core/trackedPools/trackedPoolsTypes';
import { BigDecimal } from "@subsquid/big-decimal";
import { DataIntegrityUtils } from "../support/DataIntegrityUtils";
import { V2PoolSnapshot } from '@model/generated';

interface OfficialV2Price {
    id: string,
    token0: ITrackedToken,
    token1: ITrackedToken,

    reserve0: BigDecimal,
    reserve1: BigDecimal,

    token0Price: BigDecimal,
    token1Price: BigDecimal
}

export class UniswapV2DataComparator {

    static compare(itemA: OfficialV2Price, itemB: V2PoolSnapshot): boolean {
        if (!itemA || !itemB) return false;

        if (itemA.id !== itemB.pool!.id) return false;

        if (DataIntegrityUtils.mismatchTokens(itemA.token0, itemB.pool!.token0))
            return false;
        if (DataIntegrityUtils.mismatchTokens(itemA.token1, itemB.pool!.token1))
            return false;

        if (DataIntegrityUtils.mismatchBigDecimals(itemA.reserve0, itemB.reserve0))
            return false;
        if (DataIntegrityUtils.mismatchBigDecimals(itemA.reserve1, itemB.reserve1))
            return false;

        if (DataIntegrityUtils.mismatchBigDecimals(itemA.token0Price, itemB.token0Price))
            return false;
        if (DataIntegrityUtils.mismatchBigDecimals(itemA.token1Price, itemB.token1Price))
            return false;

        return true;
    }

}


