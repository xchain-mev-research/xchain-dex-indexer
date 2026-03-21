import { ITrackedToken } from "@app/core/trackedPools/trackedPoolsTypes";
import { BigDecimal } from "@subsquid/big-decimal";

export class DataIntegrityUtils {

    public static compareTokens(tokenA: ITrackedToken, tokenB: ITrackedToken): boolean {
        if (!tokenA || !tokenB)
            return false;

        return tokenA.id === tokenB.id && tokenA.symbol === tokenB.symbol
            && tokenA.name === tokenB.name && tokenA.decimals == tokenB.decimals; // Use == to allow string/number comparison
    }

    public static mismatchTokens(tokenA: ITrackedToken, tokenB: ITrackedToken): boolean {
        return !DataIntegrityUtils.compareTokens(tokenA, tokenB);
    }

    public static compareBigDecimals(valueA: BigDecimal, valueB: BigDecimal): boolean {
        if (!valueA || !valueB)
            return false;

        return valueA.eq(valueB);
    }

    public static mismatchBigDecimals(valueA: BigDecimal | string, valueB: BigDecimal | string, decimals: number = 5): boolean {
        if (typeof valueA === 'string') {
            valueA = BigDecimal(valueA);
        }
        if (typeof valueB === 'string') {
            valueB = BigDecimal(valueB);
        }

        return !DataIntegrityUtils.compareBigDecimals(
            DataIntegrityUtils._approximateBigDecimal(valueA, decimals),
            DataIntegrityUtils._approximateBigDecimal(valueB, decimals)
        );
    }

    private static _approximateBigDecimal(value: BigDecimal, decimals: number): BigDecimal {

        // If decimal part of scaled is ≥ 0.5, round up, otherwise round down
        const valueNum = Number(value.toFixed(decimals + 1));
        const floorVal = Math.floor(valueNum);
        const rounded = (valueNum - floorVal) >= 0.5
            ? Math.ceil(valueNum)
            : floorVal;

        return BigDecimal(rounded.toFixed(decimals));
    }

}