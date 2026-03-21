import { AbiUtils } from '@app/core/utils/evm/AbiUtils';
import { Log } from '@subsquid/evm-processor';
import { V3EvmEventChecker } from '../uniV3Forks/V3EvmEventChecker';

export class V3EvmAlgebraEventChecker extends V3EvmEventChecker {

    constructor(poolAbi: any) {
        super(poolAbi);
    }

    public isFeeChangedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.poolAbi.events?.Fee);
    }

}
