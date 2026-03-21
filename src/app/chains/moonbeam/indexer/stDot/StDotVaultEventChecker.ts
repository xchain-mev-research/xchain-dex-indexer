import { AbiUtils } from '@app/core/utils/evm/AbiUtils';
import { Log } from '@subsquid/evm-processor';
import * as stDotAbi from '@abi/lst/stDot/Nimbus'; // path all'ABI completa dello smart contract

export class StDotVaultEventChecker {

    protected readonly vaultAbi: any;

    constructor(vaultAbi: any = stDotAbi) {
        this.vaultAbi = vaultAbi;
    }

    isFeeSetEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.FeeSet);
    }

    isDepositedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.Deposited);
    }

    isRedeemedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.Redeemed);
    }

    isRewardsEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.Rewards);
    }

    isLossesEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.Losses);
    }

    isPausedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.Paused);
    }

    isUnpausedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.vaultAbi.events.Unpaused);
    }

}
