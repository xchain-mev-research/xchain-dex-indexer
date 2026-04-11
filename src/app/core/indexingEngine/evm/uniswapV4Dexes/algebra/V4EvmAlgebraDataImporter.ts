import { DexConfig } from '@app/core/config/DexConfig'
import { Log } from '@subsquid/evm-processor'


import { V4PoolRepository } from '@app/core/data/V4PoolRepository'
import { ParachainInfo } from '@app/core/parachainUtils/ParachainConst'
import { ConverterUtils } from '@app/core/utils/ConverterUtils'
import { DexType, V4Pool, V4PoolSnapshot, V4PoolSnapshotTick } from '@model/generated'
import { EntityManager } from 'typeorm'
import { EvmBlock, EvmContext } from '../../../AbstractDataImporter'
import { AbstractDexDataImporter } from '../../../base/AbstractDexDataImporter'
import { V4SnapshotBootstrapper } from '../../../bootstrap/V4SnapshotBootstrapper'
import { EvmUtils } from '../../EvmUtils'
import { GenericTickTracker } from '../../uniswapV3Dexes/GenericTickTracker'
import { UniswapV3ImporterUtils } from '../../uniswapV3Dexes/UniswapV3ImporterUtils'
import { V3EvmAlgebraEventChecker } from '../../uniswapV3Dexes/algebra/V3EvmAlgebraEventChecker'
import { V3EvmEventChecker } from '../../uniswapV3Dexes/uniV3Forks/V3EvmEventChecker'
import { V4EvmAlgebraEventsProcessor } from './V4EvmAlgebraEventsProcessor'
import { createV4EvmAlgebraProcessor } from './V4EvmAlgebraProcessor'


export class V4EvmAlgebraDataImporter extends AbstractDexDataImporter<
    EvmBlock,
    EvmContext,
    Log,
    V4Pool,
    V4PoolSnapshot
> {

    protected dataProcessor: V4EvmAlgebraEventsProcessor;
    protected eventsChecker: V3EvmAlgebraEventChecker;

    protected tickTracker = new GenericTickTracker<V4PoolSnapshotTick>(V4PoolSnapshotTick);

    constructor(dexType: DexType, parachain: ParachainInfo) {
        super(dexType, parachain)

        this.dataProcessor = new V4EvmAlgebraEventsProcessor(this.dexConfig.poolAbi);
        this.eventsChecker = new V3EvmAlgebraEventChecker(this.dexConfig.poolAbi);
    }

    // ---------- OVERRIDES ----------

    protected async createProcessor(fromBlock: number, toBlock: number): Promise<any> {
        return createV4EvmAlgebraProcessor(this.dexConfig, fromBlock, toBlock);
    }

    protected async onProcessStart(): Promise<void> {
        await super.onProcessStart();
        this.tickTracker.clear();
    }

    protected async processBlock(block: EvmBlock): Promise<void> {
        this.dataProcessor.setContext(this.getCtx());

        for (let log of block.logs) {

            if (DexConfig.isFactoryTracked(log.address, this.dexConfig.chain)) {
                var maybePool: V4Pool | null = this.handleNewPoolEvent(log);
                if (maybePool != null)
                    super.handleNewPool(maybePool)
            }
            else if (this.isPoolTracked(log.address)) {

                if (this.eventsChecker.isInitializeEvent(log))
                    this.handleInitializeEvent(log);

                else if (this.eventsChecker.isMintEvent(log))
                    await this.handleMintEvent(log);

                else if (this.eventsChecker.isBurnEvent(log))
                    await this.handleBurnEvent(log);

                else if (this.eventsChecker.isSwapEvent(log))
                    this.handleSwapEvent(log);
                else if (this.eventsChecker.isFeeChangedEvent(log))
                    this._handleFeeChangedEvent(log);
                else
                    this.customLogProcess(log);
            }
        }

    }

    // To override for custom log processing
    protected customLogProcess(log: Log) {
        // Custom log processing can be added here
    }

    protected async doInserts() {
        await super.doInserts()

        var allTicks = this.tickTracker.getAllTicks();
        await this.getCtx().store.insert(allTicks);
    }

    protected toBlockPoolSnapshot(poolSnapshot: V4PoolSnapshot, blockNumber: number): V4PoolSnapshot {
        var newPoolSnapshot: V4PoolSnapshot = new V4PoolSnapshot({
            ...poolSnapshot,
            id: UniswapV3ImporterUtils.newEndBlockId(poolSnapshot.pool, blockNumber),
            afterTxId: null,
            priorityInclusionFeePerUnit: null,
            blockNumber,
            index: null,
            ticks: UniswapV3ImporterUtils.copyTicksV4(poolSnapshot.ticks),
        });

        UniswapV3ImporterUtils.updateTickIds(newPoolSnapshot);
        this.tickTracker.track(...newPoolSnapshot.ticks);

        return newPoolSnapshot
    }

    protected async loadData() {
        const data = await new V4PoolRepository((this.getCtx().store as any).em())
            .loadPoolsData(this.dexConfig.dexType);

        for (const snapshot of data.snapshotMap.values()) {
            // Ignore ticks that are already stored. Use them only for in memory calculations
            this.tickTracker.trackInMemory(...snapshot.ticks);
        }

        return data;
    }

    protected async runBootstrap(bootstrapBlock: number, em: EntityManager): Promise<void> {
        await new V4SnapshotBootstrapper(
            this.dexConfig.bootstrapConfig!,
            this.dexConfig.dexType,
            this.dexConfig.getTrackedPoolsIds(),
        ).run(bootstrapBlock, em);
    }

    protected getTxHash(log: Log): string {
        return log.getTransaction().hash;
    }

    protected getPoolAddress(log: Log): string {
        return log.address;
    }
    // END ---------- OVERRIDES ----------

    // ------- EVENTs HANDLEs -------

    handleNewPoolEvent(log: Log): V4Pool | null {
        const { token0, token1, pool } =
            this.dexConfig.factoryAbi.events.Pool.decode(log);
        const id = pool.toLowerCase();

        if (!this.dexConfig.isPoolTracked(id) || this.isPoolTracked(id))
            return null;

        const t0 = this.tokensMap.get(token0.toLowerCase());
        const t1 = this.tokensMap.get(token1.toLowerCase());

        if (!t0 || !t1) return null;

        return new V4Pool({
            id,
            createdAtBlockNumber: log.block.height,
            createdAt: ConverterUtils.timestampToDate(log.block.timestamp),
            token0: t0,
            token1: t1,
            feeTier: BigInt(0), // Compatibility placeholder — actual fee is tracked per snapshot
            dex: this.dexConfig.dexType
        });
    }

    handleInitializeEvent(log: any) {
        let extractedProperties = this.dataProcessor.processInitializeEvent(log, this.getPoolByLog(log));
        var poolSnapshot: V4PoolSnapshot = new V4PoolSnapshot(extractedProperties);

        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);
        this._afterEventHandler(log, poolSnapshot)
    }

    async handleMintEvent(log: any) {
        var poolSnapshot: V4PoolSnapshot = this.getLatestPoolSnapshot(log);
        await this.dataProcessor.processMintEvent(log, poolSnapshot, this.tickTracker.getInMemoryMap());

        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);
        this._afterEventHandler(log, poolSnapshot)
    }

    async handleBurnEvent(log: any) {
        var poolSnapshot: V4PoolSnapshot = this.getLatestPoolSnapshot(log);
        await this.dataProcessor.processBurnEvent(log, poolSnapshot, this.tickTracker.getInMemoryMap());

        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);
        this._afterEventHandler(log, poolSnapshot)
    }

    async handleSwapEvent(log: Log) {
        const pool = this.getPoolByLog(log);
        var poolSnapshot: V4PoolSnapshot = this.getLatestPoolSnapshot(log);

        this.dataProcessor.processSwapEvent(log, pool, poolSnapshot);
        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);

        this._afterEventHandler(log, poolSnapshot)
    }
    private _handleFeeChangedEvent(log: Log) {
        const event = this.dexConfig.poolAbi.events.Fee.decode(log);
        const snapshot: V4PoolSnapshot = this.getLatestPoolSnapshot(log);
        snapshot.fee = BigInt(event.fee);

        const updatedSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), snapshot);
        this._afterEventHandler(log, updatedSnapshot);
    }

    protected _afterEventHandler(log: Log, poolSnapshot: V4PoolSnapshot) {
        poolSnapshot.ticks = UniswapV3ImporterUtils.createTickEntitiesV4(poolSnapshot);

        // Update tick IDs for all ticks in this snapshot, including those unchanged by this event
        UniswapV3ImporterUtils.updateTickIds(poolSnapshot);

        this.tickTracker.track(...poolSnapshot.ticks);

        super.handleNewInternalBlockPoolSnapshot(log, poolSnapshot)
    }

    // END ------- EVENTs HANDLEs -------

    // ------- UTILS -------

    protected newPoolSnapshot(log: Log, pool: V4Pool, poolSnapshot: V4PoolSnapshot): V4PoolSnapshot {
        const tx = log.getTransaction();
        const blockNumber = log.block.height;
        const index = log.transactionIndex;

        return new V4PoolSnapshot({
            ...poolSnapshot,
            id: UniswapV3ImporterUtils.newPoolSnapshotId(log),
            blockNumber,
            afterTxId: tx.hash,
            index,
            priorityInclusionFeePerUnit: EvmUtils.calculatePriorityInclusionFee(log),

            pool,
        });
    }

    // END ------- UTILS -------

}




