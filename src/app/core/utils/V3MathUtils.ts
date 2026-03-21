import { BigDecimal } from '@subsquid/big-decimal'
import { Token } from '@model/generated'

export class V3MathUtils {

    static readonly ZERO_BI = BigInt(0);
    static readonly ONE_BI = BigInt(1);
    static readonly BI_18 = BigInt(18);

    static readonly ZERO_BD = BigDecimal('0');
    static readonly ONE_BD = BigDecimal('1');

    static readonly Q192 = Math.pow(2, 192);

    static readonly PRICE_DECIMAL_PRECISION = 6;

    static convertTokenToDecimal(amount: bigint, decimals: number): BigDecimal {
        return BigDecimal(amount).div(Math.pow(10, decimals));
    }

    static priceToTokenPrices(price: bigint, token0: Token, token1: Token): BigDecimal[] {
        const num = BigDecimal(price.toString()).times(BigDecimal(price.toString()));
        const denom = BigDecimal(V3MathUtils.Q192.toString());
        const price1 = num
            .div(denom)
            .times(V3MathUtils.exponentToBigDecimal(token0.decimals))
            .div(V3MathUtils.exponentToBigDecimal(token1.decimals));

        const price0 = V3MathUtils.safeDiv(V3MathUtils.ONE_BD, price1);

        const price0Fixed = price0.toFixed(V3MathUtils.PRICE_DECIMAL_PRECISION);
        const price1Fixed = price1.toFixed(V3MathUtils.PRICE_DECIMAL_PRECISION);

        return [BigDecimal(price0Fixed), BigDecimal(price1Fixed)];
    }

    static safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
        if (amount1 == V3MathUtils.ZERO_BD) {
            return V3MathUtils.ZERO_BD;
        } else {
            return amount0.div(amount1);
        }
    }

    static exponentToBigDecimal(decimals: number): BigDecimal {
        let bd = BigDecimal('1');
        for (let i = V3MathUtils.ZERO_BI; i < decimals; i = i + V3MathUtils.ONE_BI) {
            bd = bd.times(BigDecimal('10'));
        }
        return bd;
    }

    static bigDecimalExponated(value: BigDecimal, power: bigint): BigDecimal {
        if (power === V3MathUtils.ZERO_BI) {
            return V3MathUtils.ONE_BD;
        }

        let negativePower = power < V3MathUtils.ZERO_BI;
        let result = value;

        const powerAbs = BigInt(power.toString().replace('-', ''));
        for (let i = V3MathUtils.ONE_BI; i < powerAbs; i = i + V3MathUtils.ONE_BI) {
            const precision = 36;
            const resultApproximate = result.times(value).toFixed(precision);
            result = BigDecimal(resultApproximate);
        }

        if (negativePower) {
            result = V3MathUtils.safeDiv(V3MathUtils.ONE_BD, result);
        }

        return result;
    }
}
