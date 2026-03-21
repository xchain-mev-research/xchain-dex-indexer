import { Log } from "@subsquid/evm-processor";
import * as poolAbi from 'src/abi/stableDexes/stablePool';
import { AbiUtils } from "@app/core/utils/evm/AbiUtils";


const events = poolAbi.events;

export class StableDexEventsChecker {

    private constructor() {
        // Only utils
    }

    public static isAddLiquidityEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.AddLiquidity);
    }

    public static isRemoveLiquidityEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.RemoveLiquidity);
    }

    public static isRemoveLiquidityOneEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.RemoveLiquidityOne);
    }

    public static isRemoveLiquidityImbalanceEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.RemoveLiquidityImbalance);
    }

    public static isTokenSwapEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.TokenSwap);
    }

    public static isRampAEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.RampA);
    }

    public static isStopRampAEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.StopRampA);
    }

    public static isNewSwapFeeEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.NewSwapFee);
    }

    public static isPausedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.Paused);
    }

    public static isUnpausedEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, events.Unpaused);
    }

}