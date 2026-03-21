
import { DexConfig } from '../../../../config/DexConfig';
import { createV3EvmAlgebraProcessor } from '../../uniswapV3Dexes/algebra/V3EvmAlgebraProcessor';


export function createV4EvmAlgebraProcessor(dexConfig: DexConfig, fromBlock: number, toBlock: number) {
    return createV3EvmAlgebraProcessor(dexConfig, fromBlock, toBlock);
}

