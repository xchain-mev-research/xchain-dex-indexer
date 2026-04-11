import { DexConfig } from '@app/core/config/DexConfig'
import { Log } from '@subsquid/evm-processor'


import { V3PoolRepository } from '@app/core/data/V3PoolRepository'
import { ParachainInfo } from '@app/core/parachainUtils/ParachainConst'
import { ConverterUtils } from '@app/core/utils/ConverterUtils'
import { DexType, V3Pool, V3PoolSnapshot, V3PoolSnapshotTick } from '@model/generated'
import { EntityManager } from 'typeorm'
import { EvmBlock, EvmContext } from '../../../AbstractDataImporter'
import { AbstractDexDataImporter } from '../../../base/AbstractDexDataImporter'
import { V3SnapshotBootstrapper } from '../../../bootstrap/V3SnapshotBootstrapper'
import { EvmUtils } from '../../EvmUtils'
import { UniswapV3ImporterUtils } from '../UniswapV3ImporterUtils'
import { V3EvmEventChecker } from './V3EvmEventChecker'
import { V3EvmEventsProcessor } from './V3EvmEventsProcessor'
import { createV3EvmProcessor } from './V3EvmProcessor'
import { GenericTickTracker } from '../GenericTickTracker'


export class V3EvmDataImporter extends AbstractDexDataImporter<
    EvmBlock,
    EvmContext,
    Log,
    V3Pool,
    V3PoolSnapshot
> {

    protected dataProcessor: V3EvmEventsProcessor;
    protected eventsChecker: V3EvmEventChecker;

    protected tickTracker = new GenericTickTracker<V3PoolSnapshotTick>(V3PoolSnapshotTick);

    constructor(dexType: DexType, parachain: ParachainInfo,
        dataProcessor?: V3EvmEventsProcessor, eventsChecker?: V3EvmEventChecker) {
        super(dexType, parachain)

        this.dataProcessor = dataProcessor ?? new V3EvmEventsProcessor(this.dexConfig.poolAbi);
        this.eventsChecker = eventsChecker ?? new V3EvmEventChecker(this.dexConfig.poolAbi);
    }

    // ---------- OVERRIDES ----------

    protected async createProcessor(fromBlock: number, toBlock: number): Promise<any> {
        return createV3EvmProcessor(this.dexConfig, fromBlock, toBlock);
    }

    protected async onProcessStart(): Promise<void> {
        await super.onProcessStart();
        this.tickTracker.clear();
    }

    protected async processBlock(block: EvmBlock): Promise<void> {
        this.dataProcessor.setContext(this.getCtx());

        for (let log of block.logs) {

            if (DexConfig.isFactoryTracked(log.address, this.dexConfig.chain)) {
                var maybePool: V3Pool | null = this.handleNewPoolEvent(log);
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

    protected toBlockPoolSnapshot(poolSnapshot: V3PoolSnapshot, blockNumber: number): V3PoolSnapshot {
        var newPoolSnapshot: V3PoolSnapshot = new V3PoolSnapshot({
            ...poolSnapshot,
            id: UniswapV3ImporterUtils.newEndBlockId(poolSnapshot.pool, blockNumber),
            afterTxId: null,
            priorityInclusionFeePerUnit: null,
            blockNumber,
            index: null,
            ticks: UniswapV3ImporterUtils.copyTicks(poolSnapshot.ticks),
        });

        UniswapV3ImporterUtils.updateTickIds(newPoolSnapshot);
        this.tickTracker.track(...newPoolSnapshot.ticks);

        return newPoolSnapshot
    }

    protected async loadData() {
        const data = await new V3PoolRepository((this.getCtx().store as any).em())
            .loadPoolsData(this.dexConfig.dexType);

        for (const snapshot of data.snapshotMap.values()) {
            // Ignore ticks that are already stored. Use them only for in memory calculations
            this.tickTracker.trackInMemory(...snapshot.ticks);
        }

        return data;
    }

    protected async runBootstrap(bootstrapBlock: number, em: EntityManager): Promise<void> {
        await new V3SnapshotBootstrapper(
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

    handleNewPoolEvent(log: Log): V3Pool | null {
        let event: {
            token0: string;
            token1: string;
            fee: number;
            tickSpacing: number;
            pool: string;
        } = this.dexConfig.factoryAbi.events.PoolCreated.decode(log)

        let idIgnoreCase = event.pool.toLowerCase();

        if (!this.dexConfig.isPoolTracked(idIgnoreCase) || this.isPoolTracked(idIgnoreCase))
            return null;

        const token0 = this.tokensMap.get(event.token0.toLowerCase());
        const token1 = this.tokensMap.get(event.token1.toLowerCase());

        if (!token0 || !token1) return null;

        return new V3Pool({
            id: idIgnoreCase,
            createdAtBlockNumber: log.block.height,
            createdAt: ConverterUtils.timestampToDate(log.block.timestamp),
            feeTier: BigInt(event.fee),
            token0,
            token1,
            dex: this.dexConfig.dexType
        });
    }

    handleInitializeEvent(log: any) {
        let extractedProperties = this.dataProcessor.processInitializeEvent(log, this.getPoolByLog(log));
        var poolSnapshot: V3PoolSnapshot = new V3PoolSnapshot(extractedProperties);

        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);
        this._afterEventHandler(log, poolSnapshot)
    }

    async handleMintEvent(log: any) {
        var poolSnapshot: V3PoolSnapshot = this.getLatestPoolSnapshot(log);
        await this.dataProcessor.processMintEvent(log, poolSnapshot, this.tickTracker.getInMemoryMap());

        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);
        this._afterEventHandler(log, poolSnapshot)
    }

    async handleBurnEvent(log: any) {
        var poolSnapshot: V3PoolSnapshot = this.getLatestPoolSnapshot(log);
        await this.dataProcessor.processBurnEvent(log, poolSnapshot, this.tickTracker.getInMemoryMap());

        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);
        this._afterEventHandler(log, poolSnapshot)
    }

    async handleSwapEvent(log: Log) {
        const pool = this.getPoolByLog(log);
        var poolSnapshot: V3PoolSnapshot = this.getLatestPoolSnapshot(log);

        this.dataProcessor.processSwapEvent(log, pool, poolSnapshot);
        poolSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), poolSnapshot);

        this._afterEventHandler(log, poolSnapshot)
    }

    protected _afterEventHandler(log: Log, poolSnapshot: V3PoolSnapshot) {
        poolSnapshot.ticks = UniswapV3ImporterUtils.createTickEntities(poolSnapshot);

        // Update tick IDs for all ticks in this snapshot, including those unchanged by this event
        UniswapV3ImporterUtils.updateTickIds(poolSnapshot);

        this.tickTracker.track(...poolSnapshot.ticks);

        super.handleNewInternalBlockPoolSnapshot(log, poolSnapshot)
    }

    // END ------- EVENTs HANDLEs -------

    // ------- UTILS -------

    protected newPoolSnapshot(log: Log, pool: V3Pool, poolSnapshot: V3PoolSnapshot): V3PoolSnapshot {
        const tx = log.getTransaction();
        const blockNumber = log.block.height;
        const index = log.transactionIndex;

        return new V3PoolSnapshot({
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




