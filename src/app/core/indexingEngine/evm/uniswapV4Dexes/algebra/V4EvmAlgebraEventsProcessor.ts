


import { V3Pool, V4Pool, V4PoolSnapshot, V4PoolSnapshotTick } from '@model/generated'

import { V3MathUtils } from '@app/core/utils/V3MathUtils'
import { Log } from '@subsquid/evm-processor'
import { UniswapV3ImporterUtils } from '../../uniswapV3Dexes/UniswapV3ImporterUtils'
import { AlgebraV3BurnEvent, AlgebraV3InitializeEvent, AlgebraV3MintEvent, AlgebraV3SwapEvent } from '../../uniswapV3Dexes/algebra/V3EvmAlgebraEventsProcessor'
import { V3BurnEvent, V3InitializeEvent, V3MintEvent, V3SwapEvent } from '../../uniswapV3Dexes/uniV3Forks/V3EvmEventsProcessor'

export interface AlgebraV4SwapEvent extends AlgebraV3SwapEvent {
    overrideFee: bigint;
    pluginFee: bigint
}

export class V4EvmAlgebraEventsProcessor {

    protected ctx: any
    protected poolAbi: any

    constructor(poolAbi: any, ctx?: any) {
        this.ctx = ctx
        this.poolAbi = poolAbi
    }

    public setContext(ctx: any) {
        this.ctx = ctx;
    }


    // Mirrors V3EvmAlgebraEventsProcessor. If a dedicated UniswapV4EventsProcessor is created, this should be moved there.
    processInitializeEvent(log: Log, pool: V3Pool): Partial<V4PoolSnapshot> {
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
            pluginFee: BigInt(0),
        }
    }

    public async processMintEvent(log: Log, poolSnapshot: V4PoolSnapshot, inMemoryTicks: Map<string, V4PoolSnapshotTick>): Promise<void> {
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

    public async processBurnEvent(log: Log, poolSnapshot: V4PoolSnapshot, inMemoryTicks: Map<string, V4PoolSnapshotTick>): Promise<void> {
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

    public processSwapEvent(log: Log, pool: V4Pool, poolSnapshot: V4PoolSnapshot): void {
        var event: V3SwapEvent & {
            overrideFee: bigint;
            pluginFee: bigint
        } = this.decodeSwapEvent(log);

        //   Update the pool with the new active liquidity, price, and tick.
        poolSnapshot.liquidity = event.liquidity
        poolSnapshot.tick = event.tick
        poolSnapshot.sqrtPrice = event.sqrtPriceX96

        let prices = V3MathUtils.priceToTokenPrices(poolSnapshot.sqrtPrice, pool.token0, pool.token1)
        poolSnapshot.token0Price = prices[0]
        poolSnapshot.token1Price = prices[1]

        if (event.pluginFee != BigInt(0)) {
            console.warn(`Pool ${pool.id} has override fee or plugin fee set.`)
        }

        poolSnapshot.pluginFee = event.pluginFee
    }

    // ========== ENABLE OVERRIDE OF EVENTs DECODING ==============
    protected decodeInitializeEvent(log: Log): V3InitializeEvent {
        return this.poolAbi.events.Initialize.decode(log);
    }

    protected decodeMintEvent(log: Log): V3MintEvent {
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

    protected decodeBurnEvent(log: Log): V3BurnEvent {
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

    protected decodeSwapEvent(log: Log): V3SwapEvent & {
        overrideFee: bigint;
        pluginFee: bigint
    } {
        const event: AlgebraV4SwapEvent = this.poolAbi.events.Swap.decode(log)
        return {
            liquidity: event.liquidity,
            sqrtPriceX96: event.price,
            tick: event.tick,
            overrideFee: event.overrideFee,
            pluginFee: event.pluginFee
        }
    }

    private async _findTicksOrCreate(poolSnapshot: V4PoolSnapshot, inMemoryTicks: Map<string, V4PoolSnapshotTick>, lowerTickIndex: number, upperTickIndex: number) {
        let priceId = poolSnapshot.id
        let lowerTickId = UniswapV3ImporterUtils.newTickId(priceId, lowerTickIndex)
        let upperTickId = UniswapV3ImporterUtils.newTickId(priceId, upperTickIndex)

        // Search in memory first
        let lowerTick: V4PoolSnapshotTick | undefined = inMemoryTicks.get(lowerTickId)
        let upperTick: V4PoolSnapshotTick | undefined = inMemoryTicks.get(upperTickId)

        //  If not found, create a new ticks

        if (lowerTick)
            lowerTick = { ...lowerTick }
        else
            lowerTick = UniswapV3ImporterUtils.createTickV4(lowerTickId, lowerTickIndex, poolSnapshot)

        if (upperTick)
            upperTick = { ...upperTick }
        else
            upperTick = UniswapV3ImporterUtils.createTickV4(upperTickId, upperTickIndex, poolSnapshot)

        return { lowerTick, upperTick }
    }

}


