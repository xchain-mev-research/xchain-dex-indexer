import { lookupArchive } from '@subsquid/archive-registry';
import {
    BlockHeader, DataHandlerContext, EvmBatchProcessor, EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor';

import { Store } from '@subsquid/typeorm-store';
import { DexConfig } from '../../../../config/DexConfig';
import { RPC_ENDPOINTS } from '@app/core/config/RpcEndPoints';
import { EVM_PROCESSOR_FIELDS } from '@app/core/indexingEngine/AbstractDataImporter';



export function createV3EvmAlgebraProcessor(dexConfig: DexConfig, fromBlock: number, toBlock: number) {
    var poolAbi = dexConfig.poolAbi;

    const processor = new EvmBatchProcessor()
        .setGateway(lookupArchive(dexConfig.chain.name, { type: 'EVM' }))
        .setRpcEndpoint({
            url: RPC_ENDPOINTS[dexConfig.chain.name],
            rateLimit: 10
        })
        .setBlockRange({ from: fromBlock, to: toBlock })

        .setFinalityConfirmation(75) // 15 mins to finality
        .setFields(EVM_PROCESSOR_FIELDS)
        .addLog({
            address: [dexConfig.factoryAddress!],
            topic0: [dexConfig.factoryAbi.events.Pool.topic],
        })
        .addLog({
            address: dexConfig.getTrackedPoolsIds(),
            topic0: [
                poolAbi.events.Initialize.topic,

                poolAbi.events.Mint.topic,
                poolAbi.events.Burn.topic,
                poolAbi.events.Swap.topic,

                poolAbi.events.Fee.topic,

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

