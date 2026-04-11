import { logger } from "@app/core/log/logger";
import { IgnoreCaseMap } from "@app/core/trackedPools/trackedPoolsTypes";
import { DexType, Token } from "@model/generated";
import { Entity } from "@subsquid/typeorm-store/lib/store";
import { EntityManager } from "typeorm";
import { DexConfig } from "../../config/DexConfig";
import { ParachainInfo } from '../../parachainUtils/ParachainConst';
import { AbstractDataImporter, EvmBlock, EvmContext, SubstrateBlock, SubstrateContext } from "../AbstractDataImporter";
import { PoolRegistry } from "./PoolRegistry";
import { PoolSnapshotTracker } from "./PoolSnapshotTracker";
import { TokensRepository } from "@app/core/data/TokensRepository";


export abstract class AbstractDexDataImporter
    <   // il tipo di blocco e di contesto è definito nelle varie implementazioni
        BlockType extends EvmBlock | SubstrateBlock,
        ContextType extends EvmContext | SubstrateContext,
        LogType,

        PoolType extends Entity & { id: string },
        PoolSnapshotType extends Entity & { pool: PoolType }
    >
    extends AbstractDataImporter<BlockType, ContextType> {

    protected dexConfig: DexConfig;

    protected poolRegistry!: PoolRegistry<PoolType>;
    protected poolSnapshotTracker!: PoolSnapshotTracker<PoolSnapshotType>;

    protected tokensMap!: Map<string, Token>;

    // ---------- Per-batch variables ----------

    // tx hash → pool address → snapshot
    // Keeps only one snapshot per pool per transaction: multiple sync events
    // within the same tx cannot produce intermediate states, so only the last one is retained.
    protected mapTxHashNewPoolSnapshot!: Map<string, Map<string, PoolSnapshotType>>;
    protected endBlockPoolSnapshot!: PoolSnapshotType[];

    // END---------- Per-batch variables ----------

    // ---------- ABSTRACT ----------

    protected abstract loadData(): Promise<{
        poolsMap: IgnoreCaseMap<PoolType>,
        snapshotMap: IgnoreCaseMap<PoolSnapshotType>
    }>;

    protected abstract getTxHash(log: LogType): string;
    protected abstract getPoolAddress(log: LogType): string;

    // Creates a new end-of-block snapshot entity for the given blockHeight, keeping liquidity data unchanged.
    protected abstract toBlockPoolSnapshot(poolSnapshot: PoolSnapshotType, blockHeight: number): PoolSnapshotType;

    // END---------- ABSTRACT ----------

    constructor(dexType: DexType, parachain: ParachainInfo) {
        super(DexConfig.getConfig(dexType, parachain)!.schemaName)

        this.dexConfig = DexConfig.getConfig(dexType, parachain)!;
    }

    // ---------- OVERRIDES ----------

    protected async onProcessStart(): Promise<void> {
        // Clear context scope variables
        if (!!this.poolRegistry)
            this.poolRegistry.clearNew();

        this.mapTxHashNewPoolSnapshot = new Map()
        this.endBlockPoolSnapshot = [];

    }

    protected async initializeData(): Promise<void> {
        let ctx = this.getCtx();

        if (!this.tokensMap) {
            this.tokensMap = await TokensRepository.loadTokensMap(ctx)
            logger.info("Tokens caricati")
        }

        if (!this.poolRegistry) {
            const { poolsMap, snapshotMap } = await this.loadData();

            // Bootstrap: if no snapshots exist and a bootstrap config is provided, fetch the
            // pool state from the official subgraph at (fromBlock - 1) and persist it so that
            // gap-filling and snapshot tracking work correctly from the very first block.
            if (snapshotMap.size === 0 && this.dexConfig.bootstrapConfig) {
                const bootstrapBlock = ctx.blocks[0].header.height - 1;
                const em = (ctx.store as any).em() as EntityManager;
                logger.info(`[Bootstrap][${this.dexConfig.dexType}] No snapshots found — fetching from subgraph at block ${bootstrapBlock}...`);

                await this.runBootstrap(bootstrapBlock, em);

                const bootstrappedData = await this.loadData();
                this.poolRegistry = new PoolRegistry(bootstrappedData.poolsMap);
                this.poolSnapshotTracker = new PoolSnapshotTracker(bootstrappedData.snapshotMap);
            } else {
                this.poolRegistry = new PoolRegistry(poolsMap);
                this.poolSnapshotTracker = new PoolSnapshotTracker(snapshotMap);
            }

            logger.info("Pools caricati")
        }
    }

    /**
     * Override in subclasses to fetch pool snapshots from an official subgraph and
     * persist them to the DB before the first indexing batch runs.
     * Called only when snapshotMap is empty and bootstrapConfig is set.
     */
    protected async runBootstrap(bootstrapBlock: number, em: EntityManager): Promise<void> {
        // no-op by default
    }

    protected async processIgnoredBlock(height: number) {
        this._endBlockPoolSnapshots(height);
    }

    protected async afterProcessedBlock(block: BlockType) {
        this._endBlockPoolSnapshots(block.header.height);
    }

    private _endBlockPoolSnapshots(blockHeight: number): void {
        const snapshots = this.poolSnapshotTracker.createEndBlockSnapshots(blockHeight, this.toBlockPoolSnapshot.bind(this));
        this.endBlockPoolSnapshot.push(...snapshots);
    }

    protected async doInserts() {
        let store = this.getCtx().store;

        await store.insert(this.poolRegistry.getNew());

        var snapshots: PoolSnapshotType[] = [];

        if (this.dexConfig.intraBlockSnapshots)
            snapshots.push(...this.collectInternalBlockPoolSnapshots());

        snapshots.push(...this.endBlockPoolSnapshot);

        await store.insert(snapshots);
    }

    // END ---------- OVERRIDES ----------


    // -------- API FOR SUBCLASSES --------

    protected handleNewInternalBlockPoolSnapshot(log: LogType, poolSnapshot: PoolSnapshotType) {
        var txHash = this.getTxHash(log);

        // Create the inner map for this tx hash if not present yet
        if (!this.mapTxHashNewPoolSnapshot.has(txHash))
            this.mapTxHashNewPoolSnapshot.set(txHash, new Map())

        // If the same transaction modifies the same pool multiple times, keep only the latest snapshot (dedup by tx)
        var afterTxPoolSnapshotList: Map<string, PoolSnapshotType> = this.mapTxHashNewPoolSnapshot.get(txHash)!;

        var poolAddress = this.getPoolAddress(log);
        afterTxPoolSnapshotList.set(poolAddress, poolSnapshot)

        this.poolSnapshotTracker.track(poolSnapshot);
    }

    protected handleNewPool(pool: PoolType) {
        this.poolRegistry.add(pool);
    }

    // END -------- API FOR SUBCLASSES --------


    // ---------- UTILS ----------

    protected newPoolSnapshotId(poolSnapshot: PoolSnapshotType): string {
        return poolSnapshot.id + "-" + this.getCurrentProcessingBlockHeight() + "-end"
    }

    protected isPoolTracked(poolId: string): boolean {
        return this.poolRegistry.has(poolId);
    }

    protected getPoolByLog(log: LogType): PoolType {
        return this.poolRegistry.get(this.getPoolAddress(log))!;
    }

    protected getPoolById(poolId: string): PoolType {
        return this.poolRegistry.get(poolId)!;
    }

    protected getLatestPoolSnapshot(log: LogType): PoolSnapshotType {
        return this.poolSnapshotTracker.getLatest(this.getPoolAddress(log))!;
    }

    protected collectInternalBlockPoolSnapshots(): PoolSnapshotType[] {
        var internalBlockPoolSnapshotList: PoolSnapshotType[] = [];
        for (let poolSnapshotList /* : Map<string, PoolSnapshotType> */ of this.mapTxHashNewPoolSnapshot.values())
            internalBlockPoolSnapshotList.push(...poolSnapshotList.values())

        return internalBlockPoolSnapshotList;
    }

    // END ---------- UTILS ----------

}
