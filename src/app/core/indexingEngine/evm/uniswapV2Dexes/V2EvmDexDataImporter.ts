import { ParachainInfo } from '@app/core/parachainUtils/ParachainConst'
import { ConverterUtils } from '@app/core/utils/ConverterUtils'
import { AbiUtils } from '@app/core/utils/evm/AbiUtils'
import { DexType, V2Pool, V2PoolSnapshot } from '@model/generated'
import { BigDecimal } from '@subsquid/big-decimal'
import { EntityManager } from 'typeorm'
import { DexConfig } from '../../../config/DexConfig'
import { V3MathUtils } from '../../../utils/V3MathUtils'
import { EvmBlock, EvmContext } from '../../AbstractDataImporter'
import { AbstractDexDataImporter } from '../../base/AbstractDexDataImporter'
import { V2SnapshotBootstrapper } from '../../bootstrap/V2SnapshotBootstrapper'
import { EvmUtils } from '../EvmUtils'
import { Log, createV2Processor } from './V2EvmDexProcessor'
import { V2PoolRepository } from '@app/core/data/V2PoolRepository'


export class V2EvmDexDataImporter extends AbstractDexDataImporter<
    EvmBlock,
    EvmContext,
    Log,
    V2Pool,
    V2PoolSnapshot
> {

    constructor(dexType: DexType, parachain: ParachainInfo) {
        super(dexType, parachain);
    }

    // ---------- OVERRIDES ----------

    protected async createProcessor(fromBlock: number, toBlock: number): Promise<any> {
        return createV2Processor(this.dexConfig, fromBlock, toBlock);
    }

    protected async processBlock(block: EvmBlock): Promise<void> {
        for (let log of block.logs) {
            const logAddress = log.address.toLowerCase();

            if (DexConfig.isFactoryTracked(logAddress, this.dexConfig.chain)) {
                const maybePool = this.getPoolDataIfRelevant(log);
                if (maybePool)
                    super.handleNewPool(maybePool);
            }
            else if (this.isPoolTracked(logAddress) && this._isSyncEvent(log)) {
                const newPoolSnapshot: V2PoolSnapshot = this.getPoolSnapshot(log);
                super.handleNewInternalBlockPoolSnapshot(log, newPoolSnapshot);
            }

        }
    }

    protected toBlockPoolSnapshot(poolSnapshot: V2PoolSnapshot, blockNumber: number) {
        return new V2PoolSnapshot({
            ...poolSnapshot,
            id: `${poolSnapshot.pool.id}-${blockNumber}-end`,
            priorityInclusionFeePerUnit: null,
            afterTxId: null,
            index: null,

            blockNumber: blockNumber
        });
    }

    protected async loadData() {
        return await new V2PoolRepository((this.getCtx().store as any).em())
            .loadPoolsData(this.dexConfig.dexType);
    }

    protected async runBootstrap(bootstrapBlock: number, em: EntityManager): Promise<void> {
        await new V2SnapshotBootstrapper(
            this.dexConfig.bootstrapConfig!,
            this.dexConfig.dexType,
            this.dexConfig.getTrackedPoolsIds(),
        ).run(bootstrapBlock, em);
    }

    // END ---------- OVERRIDES ----------


    // ------- EXTRACT DATA FROM LOG -------

    getPoolDataIfRelevant(log: Log): V2Pool | null {
        let event = this.dexConfig.factoryAbi.events.PairCreated.decode(log)

        let id = event.pair.toLowerCase();

        var alreadyTracked = this.isPoolTracked(id)
        if (!this.dexConfig.isPoolTracked(id) || alreadyTracked)
            return null;

        let token0 = event.token0.toLowerCase()
        let token1 = event.token1.toLowerCase()


        return new V2Pool({
            id: id,
            createdAtBlockNumber: log.block.height,
            createdAt: ConverterUtils.timestampToDate(log.block.timestamp),

            token0: this.tokensMap.get(token0),
            token1: this.tokensMap.get(token1),
            dex: this.dexConfig.dexType,
        })
    }

    private getPoolSnapshot(log: Log): V2PoolSnapshot {

        let event = this.dexConfig.poolAbi.events.Sync.decode(log);

        var tx = log.getTransaction();
        let blockNumber = log.block.height
        let afterTxIndex = log.transactionIndex

        const pool = this.getPoolByLog(log);

        var newReserve0 = V3MathUtils.convertTokenToDecimal(event.reserve0, pool.token0.decimals)
        var newReserve1 = V3MathUtils.convertTokenToDecimal(event.reserve1, pool.token1.decimals)

        return new V2PoolSnapshot({
            id: `${pool.id}-${blockNumber}-${afterTxIndex}`,
            blockNumber: blockNumber,

            afterTxId: tx.hash,
            index: afterTxIndex,
            priorityInclusionFeePerUnit: EvmUtils.calculatePriorityInclusionFee(log),

            reserve0: newReserve0,
            reserve1: newReserve1,

            token0Price: BigDecimal(newReserve0.div(newReserve1).toFixed(V3MathUtils.PRICE_DECIMAL_PRECISION)),
            token1Price: BigDecimal(newReserve1.div(newReserve0).toFixed(V3MathUtils.PRICE_DECIMAL_PRECISION)),

            pool: pool
        })
    }

    // END ------- EXTRACT DATA FROM LOG -------
    protected getTxHash(log: Log): string {
        return log.getTransaction().hash;
    }

    protected getPoolAddress(log: Log): string {
        return log.address;
    }

    private _isSyncEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.dexConfig.poolAbi.events.Sync);
    }

}


