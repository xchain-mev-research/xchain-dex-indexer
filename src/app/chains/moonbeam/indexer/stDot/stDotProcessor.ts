import { lookupArchive } from '@subsquid/archive-registry';
import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction
} from '@subsquid/evm-processor';

import { Store } from '@subsquid/typeorm-store';
import { RPC_ENDPOINTS } from '@app/core/config/RpcEndPoints';
import { EVM_PROCESSOR_FIELDS } from '@app/core/indexingEngine/AbstractDataImporter';

import * as stDotAbi from '@abi/lst/stDot/Nimbus'; // path all'ABI completa dello smart contract
import { Parachain } from '@app/core/parachainUtils/ParachainConst';

export function createStDotProcessor(
    stDotAddress: string,
    fromBlock: number,
    toBlock: number
) {
    const chainName = Parachain.Moonbeam.name;
    const processor = new EvmBatchProcessor()
        .setGateway(lookupArchive(chainName, { type: 'EVM' }))
        .setRpcEndpoint({
            url: RPC_ENDPOINTS[chainName],
            rateLimit: 10
        })
        .setBlockRange({ from: fromBlock, to: toBlock })
        .setFinalityConfirmation(75)
        .setFields(EVM_PROCESSOR_FIELDS)

        .addLog({
            address: [stDotAddress],
            topic0: [
                stDotAbi.events.FeeSet.topic,
                stDotAbi.events.Deposited.topic,
                stDotAbi.events.Redeemed.topic,
                stDotAbi.events.Rewards.topic,
                stDotAbi.events.Losses.topic,

                stDotAbi.events.Paused.topic,
                stDotAbi.events.Unpaused.topic

            ],
            transaction: true
        });

    return processor;
}

export type Fields = EvmBatchProcessorFields<EvmBatchProcessor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
