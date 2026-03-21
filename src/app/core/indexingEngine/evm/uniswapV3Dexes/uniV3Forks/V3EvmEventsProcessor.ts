


import { V3Pool, V3PoolSnapshot, V3PoolSnapshotTick } from '@model/generated'

import { V3MathUtils } from '@app/core/utils/V3MathUtils'
import { Log } from '@subsquid/evm-processor'
import { UniswapV3ImporterUtils } from '../UniswapV3ImporterUtils'

export class V3EvmEventsProcessor {

    protected ctx: any
    protected poolAbi: any

    constructor(poolAbi: any, ctx?: any) {
        this.ctx = ctx
        this.poolAbi = poolAbi
    }

    public setContext(ctx: any) {
        this.ctx = ctx;
    }

    public processInitializeEvent(log: Log, pool: V3Pool): Partial<V3PoolSnapshot> {
        var data: V3InitializeEvent = this.decodeInitializeEvent(log);
        let prices = V3MathUtils.priceToTokenPrices(data.sqrtPriceX96, pool.token0, pool.token1)

        return {
            id: UniswapV3ImporterUtils.newPoolSnapshotId(log),

            blockNumber: log.block.height,

            pool: pool,

            afterTxId: null,
            index: null,

            liquidity: V3MathUtils.ZERO_BI,

            sqrtPrice: data.sqrtPriceX96,
            tick: data.tick,

            token0Price: prices[0],
            token1Price: prices[1],
            ticks: [],
        }
    }

    public async processMintEvent(log: Log, poolSnapshot: V3PoolSnapshot, inMemoryTicks: Map<string, V3PoolSnapshotTick>): Promise<void> {
        var event: V3MintEvent = this.decodeMintEvent(log);

        //  Pools liquidity tracks the currently active liquidity given pools current tick.
        //  We only want to update it on mint if the new position includes the current tick.
        if (
            poolSnapshot.tick !== null &&
            BigInt(event.tickLower) < poolSnapshot.tick! &&
            BigInt(event.tickUpper) > poolSnapshot.tick!
        ) {
            poolSnapshot.liquidity += event.amount;
        }

        //  tick entities
        let lowerTickIndex = event.tickLower
        let upperTickIndex = event.tickUpper

        //  Find the ticks related to the latest price in memory or in the database, otherwise create new ticks
        let { lowerTick, upperTick } = await this._findTicksOrCreate(poolSnapshot, inMemoryTicks, lowerTickIndex, upperTickIndex)

        //    Search using latest price id, then set the new ids
        poolSnapshot.id = UniswapV3ImporterUtils.newPoolSnapshotId(log);

        lowerTick.id = UniswapV3ImporterUtils.newTickId(poolSnapshot.id, Number(lowerTickIndex))
        upperTick.id = UniswapV3ImporterUtils.newTickId(poolSnapshot.id, Number(upperTickIndex))

        //    Update liquidity
        let amount: bigint = BigInt(event.amount)

        lowerTick.liquidityGross += amount
        lowerTick.liquidityNet += amount

        upperTick.liquidityGross += amount
        upperTick.liquidityNet -= amount

        if (!poolSnapshot.ticks)
            poolSnapshot.ticks = []
        poolSnapshot.ticks.push(lowerTick)
        poolSnapshot.ticks.push(upperTick)
    }

    public async processBurnEvent(log: Log, poolSnapshot: V3PoolSnapshot, inMemoryTicks: Map<string, V3PoolSnapshotTick>): Promise<void> {
        var event: V3BurnEvent = this.decodeBurnEvent(log);

        //   Pools liquidity tracks the currently active liquidity given pools current tick.
        //   We only want to update it on mint if the new position includes the current tick.
        if (
            poolSnapshot.tick !== null &&
            BigInt(event.tickLower) < poolSnapshot.tick! &&
            BigInt(event.tickUpper) > poolSnapshot.tick!
        ) {
            poolSnapshot.liquidity -= BigInt(event.amount);
        }

        //   tick entities
        let lowerTickIndex = event.tickLower
        let upperTickIndex = event.tickUpper

        let { lowerTick, upperTick } = await this._findTicksOrCreate(poolSnapshot, inMemoryTicks, lowerTickIndex, upperTickIndex)
        //   Search using latest price id, then set the new ids
        poolSnapshot.id = UniswapV3ImporterUtils.newPoolSnapshotId(log)

        lowerTick.id = UniswapV3ImporterUtils.newTickId(poolSnapshot.id, Number(lowerTickIndex))
        upperTick.id = UniswapV3ImporterUtils.newTickId(poolSnapshot.id, Number(upperTickIndex))

        //   Update liquidity
        let amount = BigInt(event.amount)

        lowerTick.liquidityGross -= amount
        lowerTick.liquidityNet -= amount
        upperTick.liquidityGross -= amount
        upperTick.liquidityNet += amount

        if (!poolSnapshot.ticks)
            poolSnapshot.ticks = []
        poolSnapshot.ticks.push(lowerTick)
        poolSnapshot.ticks.push(upperTick)
    }

    public processSwapEvent(log: Log, pool: V3Pool, poolSnapshot: V3PoolSnapshot): void {
        var event: V3SwapEvent = this.decodeSwapEvent(log);

        //   Update the pool with the new active liquidity, price, and tick.
        poolSnapshot.liquidity = event.liquidity
        poolSnapshot.tick = event.tick
        poolSnapshot.sqrtPrice = event.sqrtPriceX96

        let prices = V3MathUtils.priceToTokenPrices(poolSnapshot.sqrtPrice, pool.token0, pool.token1)
        poolSnapshot.token0Price = prices[0]
        poolSnapshot.token1Price = prices[1]
    }

    // ========== ENABLE OVERRIDE OF EVENTs DECODING ==============
    protected decodeInitializeEvent(log: Log): V3InitializeEvent {
        return this.poolAbi.events.Initialize.decode(log);
    }
    protected decodeMintEvent(log: Log): V3MintEvent {
        return this.poolAbi.events.Mint.decode(log);
    }
    protected decodeBurnEvent(log: Log): V3BurnEvent {
        return this.poolAbi.events.Burn.decode(log);
    }
    protected decodeSwapEvent(log: Log): V3SwapEvent {
        return this.poolAbi.events.Swap.decode(log);
    }

    private async _findTicksOrCreate(poolSnapshot: V3PoolSnapshot, inMemoryTicks: Map<string, V3PoolSnapshotTick>, lowerTickIndex: number, upperTickIndex: number) {
        let priceId = poolSnapshot.id
        let lowerTickId = UniswapV3ImporterUtils.newTickId(priceId, lowerTickIndex)
        let upperTickId = UniswapV3ImporterUtils.newTickId(priceId, upperTickIndex)

        // Search in memory first
        let lowerTick: V3PoolSnapshotTick | undefined = inMemoryTicks.get(lowerTickId)
        let upperTick: V3PoolSnapshotTick | undefined = inMemoryTicks.get(upperTickId)

        //  If not found, create a new ticks

        if (lowerTick)
            lowerTick = { ...lowerTick }
        else
            lowerTick = UniswapV3ImporterUtils.createTick(lowerTickId, lowerTickIndex, poolSnapshot)

        if (upperTick)
            upperTick = { ...upperTick }
        else
            upperTick = UniswapV3ImporterUtils.createTick(upperTickId, upperTickIndex, poolSnapshot)

        return { lowerTick, upperTick }
    }

}


// ------- EVENTs-------

export interface V3InitializeEvent {
    sqrtPriceX96: bigint;
    tick: number;
}

export interface V3MintEvent {
    sender: string;
    owner: string;
    tickLower: number;
    tickUpper: number;
    amount: bigint;
    amount0: bigint;
    amount1: bigint;
}

export interface V3BurnEvent {
    owner: string;
    tickLower: number;
    tickUpper: number;
    amount: bigint;
    amount0: bigint;
    amount1: bigint;
}

export interface V3SwapEvent {
    liquidity: bigint;
    sqrtPriceX96: bigint;
    tick: number;
}

// END------- EVENTs-------
