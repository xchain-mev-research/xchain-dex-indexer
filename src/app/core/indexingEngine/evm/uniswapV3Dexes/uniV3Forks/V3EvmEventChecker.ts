import { AbiUtils } from '@app/core/utils/evm/AbiUtils';
import { Log } from '@subsquid/evm-processor';

export class V3EvmEventChecker {

    protected readonly poolAbi: any;

    constructor(poolAbi: any) {
        this.poolAbi = poolAbi;
    }

    isInitializeEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.poolAbi.events.Initialize);
    }

    isBurnEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.poolAbi.events.Burn);
    }

    isMintEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.poolAbi.events.Mint);
    }

    isSwapEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.poolAbi.events.Swap);
    }
}
