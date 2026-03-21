import { BlockData, DataHandlerContext, FieldSelection } from "@subsquid/evm-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { logger } from "../log/logger";

export const EVM_PROCESSOR_FIELDS: FieldSelection = {
    log: {
        topics: true,
        data: true,
        address: true
    },
    transaction: {
        hash: true,
        gasPrice: true,

        maxPriorityFeePerGas: true,
        maxFeePerGas: true,
        type: true,
    },
    block: {
        baseFeePerGas: true
    }
};

export type EvmContext = DataHandlerContext<Store, typeof EVM_PROCESSOR_FIELDS>;
export type EvmBlock = BlockData<typeof EVM_PROCESSOR_FIELDS>;

// TODO: define proper types for Substrate blocks
export type SubstrateBlock = { header: { height: number } };
export type SubstrateContext = { blocks: any[], store: any };

// Base importer for EVM and Substrate blocks
export abstract class AbstractDataImporter<
    Block extends EvmBlock | SubstrateBlock,
    Context extends EvmContext | SubstrateContext> {

    private schemaName: string;
    private processedBlocks = 0;

    // Tracks the latest processed block to fill in end-of-block snapshots for skipped blocks
    private latestProcessedBlock!: number;

    // ---------- Per-batch variables ----------

    private ctx!: Context;
    private currentProcessingBlockHeight!: number;

    // END---------- Per-batch variables ----------

    // ---------- ABSTRACT ----------

    protected abstract createProcessor(fromBlock: number, toBlock: number): Promise<any>;

    protected abstract onProcessStart(): Promise<void>;
    protected abstract initializeData(): Promise<void>;

    protected abstract processIgnoredBlock(blockHeight: number): Promise<void>;
    protected abstract processBlock(block: Block): Promise<void>;
    protected abstract afterProcessedBlock(block: Block): Promise<void>;

    protected abstract doInserts(): Promise<void>;

    // END ---------- ABSTRACT ----------

    constructor(schemaName: string) {
        this.schemaName = schemaName;
    }

    async startImport(fromBlock: number, toBlock: number, doCommit: boolean) {
        var processor = await this.createProcessor(fromBlock, toBlock);

        var db = new TypeormDatabase({ stateSchema: this.schemaName });

        processor.run(db, async (ctx: Context) => {
            await this.processBlocks(ctx, doCommit)
        });

    }

    private async processBlocks(ctx: Context, doCommit: boolean) {
        this.ctx = ctx;

        await this._prepareExecution();

        for (let block of ctx.blocks)
            await this._processSingleBlock(block);

        if (doCommit)
            await this.doInserts()
    }

    private async _prepareExecution() {
        await this.onProcessStart();
        await this.initializeData();
        this.latestProcessedBlock ??= this.ctx.blocks[0].header.height - 1;
    }

    private async _processSingleBlock(block: Block) {
        if (this.processedBlocks % 1000 == 0) {
            console.log(`Processing block ${block.header.height}...`);
            logger.info(`Processed ${this.processedBlocks} blocks`);
        }

        this.processedBlocks++;

        this.currentProcessingBlockHeight = block.header.height;

        // Fill in end-of-block snapshots for blocks skipped since the last processed one
        for (let i = this.latestProcessedBlock + 1; i < this.currentProcessingBlockHeight; i++)
            await this.processIgnoredBlock(i);

        this.latestProcessedBlock = this.currentProcessingBlockHeight;

        await this.processBlock(block);
        await this.afterProcessedBlock(block);
    }

    // ----------- Accessors for subclasses -----------

    protected getCtx(): Context {
        return this.ctx;
    }

    protected getCurrentProcessingBlockHeight(): number {
        return this.currentProcessingBlockHeight;
    }

    // END ------- Accessors for subclasses -----------


}
