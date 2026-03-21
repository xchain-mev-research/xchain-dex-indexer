
import { StDotVaultRepository } from '@app/chains/moonbeam/db/StDotVaultRepository';
import { ConverterUtils } from '@app/core/utils/ConverterUtils';
import { AbstractDataImporter, EvmBlock, EvmContext } from "@core/indexingEngine/AbstractDataImporter";
import { EvmUtils } from "@core/indexingEngine/evm/EvmUtils";
import { StDotVaultSnapshot } from '@model/generated';
import { Log } from '@subsquid/evm-processor';
import { createStDotProcessor } from "./stDotProcessor";
import { StDotVaultEventChecker } from "./StDotVaultEventChecker";
import { StDotVaultEventProcessor } from './StDotVaultEventProcessor';


export class StDotIndexer extends AbstractDataImporter<EvmBlock, EvmContext> {

    private readonly stDotAddress: string = "0xbc7E02c4178a7dF7d3E564323a5c359dc96C4db4";
    public static readonly ST_DOT_CREATED_AT_BLOCK: number = 4_712_022;

    private eventChecker: StDotVaultEventChecker = new StDotVaultEventChecker();
    private eventProcessor: StDotVaultEventProcessor = new StDotVaultEventProcessor();

    private latestSnapshot!: StDotVaultSnapshot;

    // tx hash --> new vault snapshot
    // used to store only one record in case a transaction sends multiple sync events, since
    // it is not possible to take the intermediate prices within a transaction
    protected txHashToSnapshot!: Map<string, StDotVaultSnapshot>;

    protected endBlockSnapshotList!: StDotVaultSnapshot[];

    constructor() {
        super(ConverterUtils.nameToSnakeCase(StDotVaultSnapshot.name))
    }

    protected async createProcessor(fromBlock: number, toBlock: number): Promise<any> {
        return createStDotProcessor(this.stDotAddress, fromBlock, toBlock);
    }

    protected async onProcessStart(): Promise<void> {
        // Clear context scope variables

        this.txHashToSnapshot = new Map()
        if (!this.endBlockSnapshotList)
            this.endBlockSnapshotList = [];
        else
            this.endBlockSnapshotList.length = 0;
    }

    protected async initializeData(): Promise<void> {
        const repo = new StDotVaultRepository((this.getCtx().store as any).em());
        this.latestSnapshot = await repo.loadLatestSnapshot();
    }

    protected async doInserts(): Promise<void> {
        let store = this.getCtx().store;

        var internalBlockSnapshots: StDotVaultSnapshot[] = Array.from(this.txHashToSnapshot.values());
        await store.insert(internalBlockSnapshots)

        await store.insert(this.endBlockSnapshotList)
    }

    protected async processIgnoredBlock(height: number) {
        this._endBlockSnapshots(height);
    }

    protected async afterProcessedBlock(block: EvmBlock) {
        this._endBlockSnapshots(block.header.height);
    }

    protected async processBlock(block: EvmBlock): Promise<void> {

        for (let log of block.logs) {
            if (log.address.toLowerCase() !== this.stDotAddress.toLowerCase())
                continue;

            if (this.eventChecker.isFeeSetEvent(log))
                this.handleFeeSetEvent(log);

            else if (this.eventChecker.isDepositedEvent(log))
                this.handleDepositedEvent(log);
            else if (this.eventChecker.isRedeemedEvent(log))
                this.handleRedeemedEvent(log);

            else if (this.eventChecker.isRewardsEvent(log))
                this.handleRewardsEvent(log);
            else if (this.eventChecker.isLossesEvent(log))
                this.handleLossesEvent(log);

            else if (this.eventChecker.isPausedEvent(log))
                this.handlePausedEvent(log);
            else if (this.eventChecker.isUnpausedEvent(log))
                this.handleUnpausedEvent(log);
        }
    }


    // -------------- PROCESS EVENTs ----------

    protected handleFeeSetEvent(log: Log): void {
        var latestSnapshot = this._getLatestSnapshot();
        this.eventProcessor.processFeeSetEvent(log, latestSnapshot);

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    protected async handleDepositedEvent(log: Log): Promise<void> {
        var latestSnapshot = this._getLatestSnapshot();
        this.eventProcessor.processDepositedEvent(log, latestSnapshot);

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    protected async handleRedeemedEvent(log: Log): Promise<void> {
        var latestSnapshot = this._getLatestSnapshot();
        this.eventProcessor.processRedeemedEvent(log, latestSnapshot);

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    protected handleRewardsEvent(log: Log): void {
        var latestSnapshot = this._getLatestSnapshot();
        this.eventProcessor.processRewardsEvent(log, latestSnapshot);

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    protected handleLossesEvent(log: Log): void {
        var latestSnapshot = this._getLatestSnapshot();
        this.eventProcessor.processLossesEvent(log, latestSnapshot);

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    protected handlePausedEvent(log: Log): void {
        var latestSnapshot = this._getLatestSnapshot();
        latestSnapshot.paused = true; // Set paused state in the snapshot

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    protected handleUnpausedEvent(log: Log): void {
        var latestSnapshot = this._getLatestSnapshot();
        latestSnapshot.paused = false; // Set unpaused state in the snapshot

        this.handleNewInternalBlockSnapshot(log, latestSnapshot);
    }

    // END ---------- PROCESS EVENTs ----------


    // ---------- PRIVATE UTILs ----------
    private handleNewInternalBlockSnapshot(log: Log, snapshot: StDotVaultSnapshot) {
        snapshot = this._setAfterTxSnapshotProperties(log, snapshot);

        var txHash = log.getTransaction().hash;
        this.txHashToSnapshot.set(txHash, snapshot);

        this.latestSnapshot = snapshot;
    }

    private _endBlockSnapshots(blockHeight: number): void {
        var endBlockSnapshot: StDotVaultSnapshot = new StDotVaultSnapshot({
            ...this._getLatestSnapshot(),
            id: `${blockHeight}-end`,
            afterTxId: null,
            priorityInclusionFeePerUnit: null,
            blockNumber: blockHeight,
            index: null,
        });

        this.endBlockSnapshotList.push(endBlockSnapshot);
    }

    private _setAfterTxSnapshotProperties(log: Log, snapshot: StDotVaultSnapshot): StDotVaultSnapshot {
        const tx = log.getTransaction();
        const blockNumber = log.block.height;
        const index = log.transactionIndex;

        const txIndex = log.getTransaction().transactionIndex.toString();
        const id = `${blockNumber}-${txIndex}`;

        return new StDotVaultSnapshot({
            ...snapshot,
            id,
            blockNumber,
            afterTxId: tx.hash,
            index,
            priorityInclusionFeePerUnit: EvmUtils.calculatePriorityInclusionFee(log),
        });
    }

    private _clone(original: StDotVaultSnapshot): StDotVaultSnapshot {
        return new StDotVaultSnapshot({ ...original });
    }

    private _getLatestSnapshot(): StDotVaultSnapshot {
        return this._clone(this.latestSnapshot);
    }

    // END ------ PRIVATE UTILs ----------

}