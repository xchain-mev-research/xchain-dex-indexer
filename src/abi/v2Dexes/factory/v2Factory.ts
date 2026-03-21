import * as ethers from 'ethers'
import { LogEvent, Func, ContractBase } from '../../abi.support'
import { ABI_JSON } from './v2Factory.abi'

export const abi = new ethers.Interface(ABI_JSON);

export const events = {
    PairCreated: new LogEvent<([token0: string, token1: string, pair: string, _: bigint] & { token0: string, token1: string, pair: string })>(
        abi, '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
    ),
}

export const functions = {
    INIT_CODE_PAIR_HASH: new Func<[], {}, string>(
        abi, '0x5855a25a'
    ),
    allPairs: new Func<[_: bigint], {}, string>(
        abi, '0x1e3dd18b'
    ),
    allPairsLength: new Func<[], {}, bigint>(
        abi, '0x574f2ba3'
    ),
    createPair: new Func<[tokenA: string, tokenB: string], { tokenA: string, tokenB: string }, string>(
        abi, '0xc9c65396'
    ),
    feeTo: new Func<[], {}, string>(
        abi, '0x017e7e58'
    ),
    feeToSetter: new Func<[], {}, string>(
        abi, '0x094b7415'
    ),
    getPair: new Func<[_: string, _: string], {}, string>(
        abi, '0xe6a43905'
    ),
    migrator: new Func<[], {}, string>(
        abi, '0x7cd07e47'
    ),
    pairCodeHash: new Func<[], {}, string>(
        abi, '0x9aab9248'
    ),
    setDevFee: new Func<[_pair: string, _devFee: number], { _pair: string, _devFee: number }, []>(
        abi, '0xef0bc993'
    ),
    setFeeTo: new Func<[_feeTo: string], { _feeTo: string }, []>(
        abi, '0xf46901ed'
    ),
    setFeeToSetter: new Func<[_feeToSetter: string], { _feeToSetter: string }, []>(
        abi, '0xa2e74af6'
    ),
    setMigrator: new Func<[_migrator: string], { _migrator: string }, []>(
        abi, '0x23cf3118'
    ),
    setSwapFee: new Func<[_pair: string, _swapFee: number], { _pair: string, _swapFee: number }, []>(
        abi, '0x9e68ceb8'
    ),
}

export class Contract extends ContractBase {

    INIT_CODE_PAIR_HASH(): Promise<string> {
        return this.eth_call(functions.INIT_CODE_PAIR_HASH, [])
    }

    allPairs(arg0: bigint): Promise<string> {
        return this.eth_call(functions.allPairs, [arg0])
    }

    allPairsLength(): Promise<bigint> {
        return this.eth_call(functions.allPairsLength, [])
    }

    feeTo(): Promise<string> {
        return this.eth_call(functions.feeTo, [])
    }

    feeToSetter(): Promise<string> {
        return this.eth_call(functions.feeToSetter, [])
    }

    getPair(arg0: string, arg1: string): Promise<string> {
        return this.eth_call(functions.getPair, [arg0, arg1])
    }

    migrator(): Promise<string> {
        return this.eth_call(functions.migrator, [])
    }

    pairCodeHash(): Promise<string> {
        return this.eth_call(functions.pairCodeHash, [])
    }
}
