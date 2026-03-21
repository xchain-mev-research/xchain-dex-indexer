import { V3MathUtils } from '@app/core/utils/V3MathUtils'
import { Log } from '@subsquid/evm-processor'
import { V3Pool, V3PoolSnapshot } from '@model/generated'
import { UniswapV3ImporterUtils } from '../UniswapV3ImporterUtils'
import { V3BurnEvent, V3MintEvent, V3SwapEvent, V3EvmEventsProcessor } from '../uniV3Forks/V3EvmEventsProcessor'

// ------- EVENT Types -------
export interface AlgebraV3InitializeEvent {
    price: bigint
    tick: number
}

export interface AlgebraV3SwapEvent {
    recipient: string
    sender: string
    amount0: bigint
    amount1: bigint
    liquidity: bigint
    price: bigint
    tick: number
}
export interface AlgebraV3MintEvent {
    sender: string;
    owner: string;
    bottomTick: number;
    topTick: number;
    liquidityAmount: bigint;
    amount0: bigint;
    amount1: bigint;
}

export interface AlgebraV3BurnEvent {
    owner: string;
    bottomTick: number;
    topTick: number;
    liquidityAmount: bigint;
    amount0: bigint;
    amount1: bigint;
}

// --------------------------

export class V3EvmAlgebraEventsProcessor extends V3EvmEventsProcessor {

    constructor(poolAbi: any, ctx?: any) {
        super(poolAbi, ctx)
    }

    override processInitializeEvent(log: Log, pool: V3Pool): Partial<V3PoolSnapshot> {
        const data: AlgebraV3InitializeEvent = this.poolAbi.events.Initialize.decode(log)
        let prices = V3MathUtils.priceToTokenPrices(data.price, pool.token0, pool.token1)

        return {
            id: UniswapV3ImporterUtils.newPoolSnapshotId(log),
            blockNumber: log.block.height,
            pool,
            afterTxId: null,
            index: null,
            fee: BigInt(100), // Fixed fee (or replace with dynamic if available),
            liquidity: V3MathUtils.ZERO_BI,
            sqrtPrice: data.price,
            tick: data.tick,
            token0Price: prices[0],
            token1Price: prices[1],
            ticks: [],
        }
    }

    protected override decodeMintEvent(log: Log): V3MintEvent {
        const event: AlgebraV3MintEvent = this.poolAbi.events.Mint.decode(log)
        return {
            sender: event.sender,
            owner: event.owner,
            tickLower: event.bottomTick,
            tickUpper: event.topTick,
            amount: event.liquidityAmount,
            amount0: event.amount0,
            amount1: event.amount1,
        }
    }

    protected override decodeBurnEvent(log: Log): V3BurnEvent {
        const event: AlgebraV3BurnEvent = this.poolAbi.events.Burn.decode(log)
        return {
            owner: event.owner,
            tickLower: event.bottomTick,
            tickUpper: event.topTick,
            amount: event.liquidityAmount,
            amount0: event.amount0,
            amount1: event.amount1,
        }
    }

    protected override decodeSwapEvent(log: Log): V3SwapEvent {
        const event: AlgebraV3SwapEvent = this.poolAbi.events.Swap.decode(log)
        return {
            liquidity: event.liquidity,
            sqrtPriceX96: event.price,
            tick: event.tick,
        }
    }

}
