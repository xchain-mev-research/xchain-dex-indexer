import { lookupArchive } from '@subsquid/archive-registry';
import {
    BlockHeader, DataHandlerContext, EvmBatchProcessor, EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor';

import { events } from '../../../../abi/v2Dexes/factory/v2Factory';

import { Store } from '@subsquid/typeorm-store';
import { DexType } from '@model/generated';
import { DexConfig } from '../../config/DexConfig';
import { Parachain } from '@app/core/parachainUtils/ParachainConst';


export function createOnceProcessor() {
    var dexConfig: DexConfig = DexConfig.getConfig(DexType.STELLASWAP_V2, Parachain.Moonbeam)!;

    const processor = new EvmBatchProcessor()
        .setGateway(lookupArchive('moonbeam', { type: 'EVM' }))
        .setRpcEndpoint({
            url: process.env.RPC_MOONBEAM_HTTP!,
            rateLimit: 10
        })
        .setBlockRange({ from: 2801473, to: 2801474 })

        .setFinalityConfirmation(75) // 15 mins to finality
        .setFields({
            log: {
                topics: true,
                data: true,
                address: true
            },
            transaction: {
                hash: true,
            },
        })
        .addLog({
            address: [dexConfig.factoryAddress!],
            topic0: [events.PairCreated.topic],
        })
        ;

    return processor;
}

export type Fields = EvmBatchProcessorFields<EvmBatchProcessor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>

