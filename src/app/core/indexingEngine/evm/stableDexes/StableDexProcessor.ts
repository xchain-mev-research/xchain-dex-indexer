import { lookupArchive } from '@subsquid/archive-registry';
import {
    BlockHeader, DataHandlerContext, EvmBatchProcessor, EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor';

import { Store } from '@subsquid/typeorm-store';
import { RPC_ENDPOINTS } from '@app/core/config/RpcEndPoints';
import { DexConfig } from '@app/core/config/DexConfig';
import { EVM_PROCESSOR_FIELDS } from '../../AbstractDataImporter';

export function createStableDexProcessor(dexConfig: DexConfig, fromBlock: number, toBlock: number) {
    var poolAbi = dexConfig.poolAbi;

    const processor = new EvmBatchProcessor()
        .setGateway(lookupArchive('moonbeam', { type: 'EVM' }))
        .setRpcEndpoint({
            url: RPC_ENDPOINTS[dexConfig.chain.name],
            rateLimit: 10
        })
        .setBlockRange({ from: fromBlock, to: toBlock })

        .setFinalityConfirmation(75) // 15 mins to finality
        .setFields(EVM_PROCESSOR_FIELDS)
        // Not tracking factory pool creation, the pools are manually inserted in the DB
        // .addLog({
        //     address: [dexConfig.factoryAddress],
        //     topic0: [factoryAbi.events.PoolCreated.topic],
        // })
        .addLog({
            address: dexConfig.getTrackedPoolsIds(),
            topic0: [
                poolAbi.events.AddLiquidity.topic,
                poolAbi.events.RemoveLiquidity.topic,
                poolAbi.events.RemoveLiquidityOne.topic,
                poolAbi.events.RemoveLiquidityImbalance.topic,

                poolAbi.events.TokenSwap.topic,

                poolAbi.events.RampA.topic,
                poolAbi.events.StopRampA.topic,

                poolAbi.events.NewSwapFee.topic,

                poolAbi.events.Paused.topic,
                poolAbi.events.Unpaused.topic,

            ],
            transaction: true,
        })
        ;

    return processor;
}

export type Fields = EvmBatchProcessorFields<EvmBatchProcessor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>

