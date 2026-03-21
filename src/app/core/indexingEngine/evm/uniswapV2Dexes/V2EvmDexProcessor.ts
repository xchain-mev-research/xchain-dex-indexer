import { lookupArchive } from '@subsquid/archive-registry';
import {
    BlockHeader, DataHandlerContext, EvmBatchProcessor, EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor';

import { RPC_ENDPOINTS } from '@app/core/config/RpcEndPoints';
import { Store } from '@subsquid/typeorm-store';
import { DexConfig } from '../../../config/DexConfig';
import { EVM_PROCESSOR_FIELDS } from '../../AbstractDataImporter';


export function createV2Processor(dexConfig: DexConfig, fromBlock: number, toBlock: number) {

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
            topic0: [dexConfig.factoryAbi.events.PairCreated.topic],
        })
        .addLog({
            address: dexConfig.getTrackedPoolsIds(),
            topic0: [dexConfig.poolAbi.events.Sync.topic],
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

