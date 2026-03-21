import * as stDotAbi from '@abi/lst/stDot/Nimbus'; // path all'ABI completa dello smart contract
import { logger } from '@app/core/log/logger';
import { StDotVaultSnapshot } from '@model/generated';
import { BigDecimal } from '@subsquid/big-decimal';
import { Log } from '@subsquid/evm-processor';

export interface FeeSetEvent {
    fee: number
    feeTreasuryBP: number
    feeDevelopersBP: number
}

export interface DepositedEvent {
    sender: string
    amount: bigint
    shares: bigint
}

export interface RedeemedEvent {
    receiver: string
    amount: bigint
    shares: bigint
}

export interface RewardsEvent {
    ledger: string
    rewards: bigint
    balance: bigint
}

export interface LossesEvent {
    ledger: string
    losses: bigint
    balance: bigint
}

export class StDotVaultEventProcessor {
    protected ctx: any
    protected vaultAbi: any

    constructor(vaultAbi: any = stDotAbi, ctx?: any) {
        this.ctx = ctx
        this.vaultAbi = vaultAbi
    }

    public setContext(ctx: any) {
        this.ctx = ctx
    }

    public processFeeSetEvent(log: Log, snapshot: StDotVaultSnapshot): void {
        const event: FeeSetEvent = this.decodeFeeSetEvent(log)

        snapshot.fee = event.fee
        snapshot.feeTreasuryBP = event.feeTreasuryBP
        snapshot.feeDevelopersBP = event.feeDevelopersBP
    }

    public processDepositedEvent(log: Log, snapshot: StDotVaultSnapshot): void {
        const event: DepositedEvent = this.decodeDepositedEvent(log)

        const oldRate = snapshot.exchangeRate;

        snapshot.totalDot = snapshot.totalDot + BigInt(event.amount)
        snapshot.totalStDot = snapshot.totalStDot + BigInt(event.shares)
        // Deposit does not change the exchange rate
        const newRate = BigDecimal(snapshot.totalDot).div(BigDecimal(snapshot.totalStDot));

        if (oldRate.minus(newRate).abs().gt(0.001)) {
            logger.warn('Exchange rate drifted after deposit:', newRate.toString())
        }
    }

    public processRedeemedEvent(log: Log, snapshot: StDotVaultSnapshot): void {
        const event: RedeemedEvent = this.decodeRedeemedEvent(log)
        const oldRate = snapshot.exchangeRate;

        snapshot.totalDot = snapshot.totalDot - BigInt(event.amount)
        snapshot.totalStDot = snapshot.totalStDot - BigInt(event.shares)

        const newRate = BigDecimal(snapshot.totalDot).div(BigDecimal(snapshot.totalStDot));

        if (oldRate.minus(newRate).abs().gt(0.001)) {
            logger.warn('Exchange rate drifted after deposit:', newRate.toString())
        }

    }

    public processRewardsEvent(log: Log, snapshot: StDotVaultSnapshot): void {
        const event: RewardsEvent = this.decodeRewardsEvent(log)

        snapshot.totalDot = snapshot.totalDot + BigInt(event.rewards)

        const rateApproximed = BigDecimal(snapshot.totalDot).div(BigDecimal(snapshot.totalStDot))
            .toFixed(6);

        snapshot.exchangeRate = BigDecimal(rateApproximed);
    }

    public processLossesEvent(log: Log, snapshot: StDotVaultSnapshot): void {
        const event: LossesEvent = this.decodeLossesEvent(log)

        snapshot.totalDot = snapshot.totalDot - BigInt(event.losses)

        if (snapshot.totalStDot > 0) {
            const rateApproximed: string = BigDecimal(snapshot.totalDot).div(BigDecimal(snapshot.totalStDot))
                .toFixed(6);
            snapshot.exchangeRate = BigDecimal(rateApproximed);
        } else
            snapshot.exchangeRate = BigDecimal(0);

    }

    protected decodeFeeSetEvent(log: Log): FeeSetEvent {
        return this.vaultAbi.events.FeeSet.decode(log);
    }

    protected decodeDepositedEvent(log: Log): DepositedEvent {
        return this.vaultAbi.events.Deposited.decode(log);
    }

    protected decodeRedeemedEvent(log: Log): RedeemedEvent {
        return this.vaultAbi.events.Redeemed.decode(log);
    }

    protected decodeRewardsEvent(log: Log): RewardsEvent {
        return this.vaultAbi.events.Rewards.decode(log);
    }

    protected decodeLossesEvent(log: Log): LossesEvent {
        return this.vaultAbi.events.Losses.decode(log);
    }

}
