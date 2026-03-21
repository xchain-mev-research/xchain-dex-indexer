import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Approval: event("0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", "Approval(address,address,uint256)", { "owner": indexed(p.address), "spender": indexed(p.address), "value": p.uint256 }),
    Claimed: event("0xd8138f8a3f377c5259ca548e70e4c2de94f129f5a11036a15b69513cba2b426a", "Claimed(address,uint256)", { "receiver": indexed(p.address), "amount": p.uint256 }),
    Deposited: event("0x73a19dd210f1a7f902193214c0ee91dd35ee5b4d920cba8d519eca65a7b488ca", "Deposited(address,uint256,uint256)", { "sender": indexed(p.address), "amount": p.uint256, "shares": p.uint256 }),
    FeeSet: event("0x226ba4aeea5a508616bde5d143d75bf6da7a845ecefb1fdfdadf4da54e71cd65", "FeeSet(uint16,uint16,uint16)", { "fee": p.uint16, "feeTreasuryBP": p.uint16, "feeDevelopersBP": p.uint16 }),
    LedgerAdd: event("0x4522989a180263bb7fbc1471718de7bdd69a5d36b5d29511958afa11d2e9da04", "LedgerAdd(address,bytes32,bytes32)", { "addr": p.address, "stashAccount": p.bytes32, "controllerAccount": p.bytes32 }),
    LedgerDisable: event("0x85accaad76657cef23e292273789ae7a13d87db42feff1d70d4056c20d78d071", "LedgerDisable(address)", { "addr": p.address }),
    LedgerPaused: event("0xe5526d35f0db491e3e7690717b21c8148a1b5eef07240279db75404df228a593", "LedgerPaused(address)", { "addr": p.address }),
    LedgerRemove: event("0xd80173368774864e15485d9749961d73c4199e9ef55d044c8ad3427a15ee1517", "LedgerRemove(address)", { "addr": p.address }),
    LedgerResumed: event("0x8c097d4c8d964b147a04f3a822a31e3aa5a9104dc7db3dde0166a248b8f106c5", "LedgerResumed(address)", { "addr": p.address }),
    Losses: event("0x28457ba4ae46aeb68ba5c1a1c15506fb3212bfff27da04dee70b81023a9ebc04", "Losses(address,uint256,uint256)", { "ledger": p.address, "losses": p.uint256, "balance": p.uint256 }),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", { "account": p.address }),
    Redeemed: event("0xf3a670cd3af7d64b488926880889d08a8585a138ff455227af6737339a1ec262", "Redeemed(address,uint256,uint256)", { "receiver": indexed(p.address), "amount": p.uint256, "shares": p.uint256 }),
    Referral: event("0x90f46099733ed637df811df4fcc5cae4961192ca04f36da9ab64b4dd8dc9b7f5", "Referral(address,address,uint256,uint256)", { "userAddr": p.address, "referralAddr": p.address, "amount": p.uint256, "shares": p.uint256 }),
    Rewards: event("0x61953b03ced70bb23c53b5a7058e431e3db88cf84a72660faea0849b785c43bd", "Rewards(address,uint256,uint256)", { "ledger": p.address, "rewards": p.uint256, "balance": p.uint256 }),
    Transfer: event("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "Transfer(address,address,uint256)", { "from": indexed(p.address), "to": indexed(p.address), "value": p.uint256 }),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", { "account": p.address }),
}

export const functions = {
    AUTH_MANAGER: viewFun("0xa1e206c7", "AUTH_MANAGER()", {}, p.address),
    LEDGER_BEACON: viewFun("0xec70d800", "LEDGER_BEACON()", {}, p.address),
    MAX_ALLOWABLE_DIFFERENCE: viewFun("0x6a92b586", "MAX_ALLOWABLE_DIFFERENCE()", {}, p.uint128),
    ORACLE_MASTER: viewFun("0x3fd2c16a", "ORACLE_MASTER()", {}, p.address),
    addLedger: fun("0x4730019e", "addLedger(bytes32,bytes32,uint16,bool)", { "_stashAccount": p.bytes32, "_controllerAccount": p.bytes32, "_index": p.uint16, "isMsig": p.bool }, p.address),
    allowance: viewFun("0xdd62ed3e", "allowance(address,address)", { "_owner": p.address, "_spender": p.address }, p.uint256),
    approve: fun("0x095ea7b3", "approve(address,uint256)", { "_spender": p.address, "_amount": p.uint256 }, p.bool),
    balanceOf: viewFun("0x70a08231", "balanceOf(address)", { "_account": p.address }, p.uint256),
    bufferedDeposits: viewFun("0xb09f5320", "bufferedDeposits()", {}, p.uint256),
    bufferedRedeems: viewFun("0x48c696c0", "bufferedRedeems()", {}, p.uint256),
    claimUnbonded: fun("0x1a813a3c", "claimUnbonded()", {},),
    decimals: viewFun("0x313ce567", "decimals()", {}, p.uint8),
    decreaseAllowance: fun("0xa457c2d7", "decreaseAllowance(address,uint256)", { "_spender": p.address, "_subtractedValue": p.uint256 }, p.bool),
    'deposit(uint256,address)': fun("0x6e553f65", "deposit(uint256,address)", { "_amount": p.uint256, "_referral": p.address }, p.uint256),
    'deposit(uint256)': fun("0xb6b55f25", "deposit(uint256)", { "_amount": p.uint256 }, p.uint256),
    depositCap: viewFun("0xdbd5edc7", "depositCap()", {}, p.uint256),
    disableLedger: fun("0xf339a70d", "disableLedger(address)", { "_ledgerAddress": p.address },),
    distributeLosses: fun("0x9e0c9704", "distributeLosses(uint256,uint256)", { "_totalLosses": p.uint256, "_ledgerBalance": p.uint256 },),
    distributeRewards: fun("0xdf6c39fb", "distributeRewards(uint256,uint256)", { "_totalRewards": p.uint256, "_ledgerBalance": p.uint256 },),
    emergencyPauseLedger: fun("0xcdd8f598", "emergencyPauseLedger(address)", { "_ledgerAddress": p.address },),
    findLedger: viewFun("0x240359bc", "findLedger(bytes32)", { "_stashAccount": p.bytes32 }, p.address),
    flushStakes: fun("0xfa597e07", "flushStakes()", {},),
    fundRaisedBalance: viewFun("0xe40b9255", "fundRaisedBalance()", {}, p.uint256),
    getLedgerAddresses: viewFun("0xdf197956", "getLedgerAddresses()", {}, p.array(p.address)),
    getPooledTokenByShares: viewFun("0xa797ec21", "getPooledTokenByShares(uint256)", { "_sharesAmount": p.uint256 }, p.uint256),
    getSharesByPooledToken: viewFun("0x4a9b4b66", "getSharesByPooledToken(uint256)", { "_amount": p.uint256 }, p.uint256),
    getStashAccounts: viewFun("0x1d55fde4", "getStashAccounts()", {}, p.array(p.bytes32)),
    getTotalPooledToken: viewFun("0xb6f81c85", "getTotalPooledToken()", {}, p.uint256),
    getUnbonded: viewFun("0x77c96574", "getUnbonded(address)", { "_holder": p.address }, { "waiting": p.uint256, "unbonded": p.uint256 }),
    increaseAllowance: fun("0x39509351", "increaseAllowance(address,uint256)", { "_spender": p.address, "_addedValue": p.uint256 }, p.bool),
    initialize: fun("0xb7361454", "initialize(address,address,address,address,address,address,address,uint256,uint128,string,string,uint8)", { "_authManager": p.address, "_xcTOKEN": p.address, "_controller": p.address, "_developers": p.address, "_treasury": p.address, "_oracleMaster": p.address, "_withdrawal": p.address, "_depositCap": p.uint256, "_maxAllowableDifference": p.uint128, "__name": p.string, "__symbol": p.string, "__decimals": p.uint8 },),
    ledgerBorrow: viewFun("0x5e442a9b", "ledgerBorrow(address)", { "_0": p.address }, p.uint256),
    ledgerStake: viewFun("0xf1447195", "ledgerStake(address)", { "_0": p.address }, p.uint256),
    name: viewFun("0x06fdde03", "name()", {}, p.string),
    nominateBatch: fun("0x41c262c5", "nominateBatch(bytes32[],bytes32[][])", { "_stashAccounts": p.array(p.bytes32), "_validators": p.array(p.array(p.bytes32)) },),
    pause: fun("0x8456cb59", "pause()", {},),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    redeem: fun("0xdb006a75", "redeem(uint256)", { "_amount": p.uint256 },),
    removeLedger: fun("0xd381787a", "removeLedger(address)", { "_ledgerAddress": p.address },),
    resume: fun("0x046f7da2", "resume()", {},),
    resumeLedger: fun("0x1ab81cba", "resumeLedger(address)", { "_ledgerAddress": p.address },),
    setDepositCap: fun("0x86651203", "setDepositCap(uint256)", { "_depositCap": p.uint256 },),
    setDevelopersTreasury: fun("0xdd232178", "setDevelopersTreasury(address,address)", { "_treasury": p.address, "_developers": p.address },),
    setFee: fun("0x99b64de1", "setFee(uint16,uint16)", { "_feeTreasury": p.uint16, "_feeDevelopers": p.uint16 },),
    setLedgerBeacon: fun("0x47376473", "setLedgerBeacon(address)", { "_ledgerBeacon": p.address },),
    setLedgerFactory: fun("0xf7eba420", "setLedgerFactory(address)", { "_ledgerFactory": p.address },),
    setMaxAllowableDifference: fun("0x5f3f2cac", "setMaxAllowableDifference(uint128)", { "_maxAllowableDifference": p.uint128 },),
    setRelaySpec: fun("0x38dee1d3", "setRelaySpec((uint16,uint128,uint128,uint256))", { "_relaySpec": p.struct({ "maxValidatorsPerLedger": p.uint16, "minNominatorBalance": p.uint128, "ledgerMinimumActiveBalance": p.uint128, "maxUnlockingChunks": p.uint256 }) },),
    symbol: viewFun("0x95d89b41", "symbol()", {}, p.string),
    totalSupply: viewFun("0x18160ddd", "totalSupply()", {}, p.uint256),
    transfer: fun("0xa9059cbb", "transfer(address,uint256)", { "_recipient": p.address, "_amount": p.uint256 }, p.bool),
    transferFrom: fun("0x23b872dd", "transferFrom(address,address,uint256)", { "_sender": p.address, "_recipient": p.address, "_amount": p.uint256 }, p.bool),
    transferFromLedger: fun("0x61f9c3da", "transferFromLedger(uint256,uint256)", { "_amount": p.uint256, "_excess": p.uint256 },),
    transferToLedger: fun("0xe1006107", "transferToLedger(uint256)", { "_amount": p.uint256 },),
}

export class Contract extends ContractBase {

    AUTH_MANAGER() {
        return this.eth_call(functions.AUTH_MANAGER, {})
    }

    LEDGER_BEACON() {
        return this.eth_call(functions.LEDGER_BEACON, {})
    }

    MAX_ALLOWABLE_DIFFERENCE() {
        return this.eth_call(functions.MAX_ALLOWABLE_DIFFERENCE, {})
    }

    ORACLE_MASTER() {
        return this.eth_call(functions.ORACLE_MASTER, {})
    }

    allowance(_owner: AllowanceParams["_owner"], _spender: AllowanceParams["_spender"]) {
        return this.eth_call(functions.allowance, { _owner, _spender })
    }

    balanceOf(_account: BalanceOfParams["_account"]) {
        return this.eth_call(functions.balanceOf, { _account })
    }

    bufferedDeposits() {
        return this.eth_call(functions.bufferedDeposits, {})
    }

    bufferedRedeems() {
        return this.eth_call(functions.bufferedRedeems, {})
    }

    decimals() {
        return this.eth_call(functions.decimals, {})
    }

    depositCap() {
        return this.eth_call(functions.depositCap, {})
    }

    findLedger(_stashAccount: FindLedgerParams["_stashAccount"]) {
        return this.eth_call(functions.findLedger, { _stashAccount })
    }

    fundRaisedBalance() {
        return this.eth_call(functions.fundRaisedBalance, {})
    }

    getLedgerAddresses() {
        return this.eth_call(functions.getLedgerAddresses, {})
    }

    getPooledTokenByShares(_sharesAmount: GetPooledTokenBySharesParams["_sharesAmount"]) {
        return this.eth_call(functions.getPooledTokenByShares, { _sharesAmount })
    }

    getSharesByPooledToken(_amount: GetSharesByPooledTokenParams["_amount"]) {
        return this.eth_call(functions.getSharesByPooledToken, { _amount })
    }

    getStashAccounts() {
        return this.eth_call(functions.getStashAccounts, {})
    }

    getTotalPooledToken() {
        return this.eth_call(functions.getTotalPooledToken, {})
    }

    getUnbonded(_holder: GetUnbondedParams["_holder"]) {
        return this.eth_call(functions.getUnbonded, { _holder })
    }

    ledgerBorrow(_0: LedgerBorrowParams["_0"]) {
        return this.eth_call(functions.ledgerBorrow, { _0 })
    }

    ledgerStake(_0: LedgerStakeParams["_0"]) {
        return this.eth_call(functions.ledgerStake, { _0 })
    }

    name() {
        return this.eth_call(functions.name, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    symbol() {
        return this.eth_call(functions.symbol, {})
    }

    totalSupply() {
        return this.eth_call(functions.totalSupply, {})
    }
}

/// Event types
export type ApprovalEventArgs = EParams<typeof events.Approval>
export type ClaimedEventArgs = EParams<typeof events.Claimed>
export type DepositedEventArgs = EParams<typeof events.Deposited>
export type FeeSetEventArgs = EParams<typeof events.FeeSet>
export type LedgerAddEventArgs = EParams<typeof events.LedgerAdd>
export type LedgerDisableEventArgs = EParams<typeof events.LedgerDisable>
export type LedgerPausedEventArgs = EParams<typeof events.LedgerPaused>
export type LedgerRemoveEventArgs = EParams<typeof events.LedgerRemove>
export type LedgerResumedEventArgs = EParams<typeof events.LedgerResumed>
export type LossesEventArgs = EParams<typeof events.Losses>
export type PausedEventArgs = EParams<typeof events.Paused>
export type RedeemedEventArgs = EParams<typeof events.Redeemed>
export type ReferralEventArgs = EParams<typeof events.Referral>
export type RewardsEventArgs = EParams<typeof events.Rewards>
export type TransferEventArgs = EParams<typeof events.Transfer>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>

/// Function types
export type AUTH_MANAGERParams = FunctionArguments<typeof functions.AUTH_MANAGER>
export type AUTH_MANAGERReturn = FunctionReturn<typeof functions.AUTH_MANAGER>

export type LEDGER_BEACONParams = FunctionArguments<typeof functions.LEDGER_BEACON>
export type LEDGER_BEACONReturn = FunctionReturn<typeof functions.LEDGER_BEACON>

export type MAX_ALLOWABLE_DIFFERENCEParams = FunctionArguments<typeof functions.MAX_ALLOWABLE_DIFFERENCE>
export type MAX_ALLOWABLE_DIFFERENCEReturn = FunctionReturn<typeof functions.MAX_ALLOWABLE_DIFFERENCE>

export type ORACLE_MASTERParams = FunctionArguments<typeof functions.ORACLE_MASTER>
export type ORACLE_MASTERReturn = FunctionReturn<typeof functions.ORACLE_MASTER>

export type AddLedgerParams = FunctionArguments<typeof functions.addLedger>
export type AddLedgerReturn = FunctionReturn<typeof functions.addLedger>

export type AllowanceParams = FunctionArguments<typeof functions.allowance>
export type AllowanceReturn = FunctionReturn<typeof functions.allowance>

export type ApproveParams = FunctionArguments<typeof functions.approve>
export type ApproveReturn = FunctionReturn<typeof functions.approve>

export type BalanceOfParams = FunctionArguments<typeof functions.balanceOf>
export type BalanceOfReturn = FunctionReturn<typeof functions.balanceOf>

export type BufferedDepositsParams = FunctionArguments<typeof functions.bufferedDeposits>
export type BufferedDepositsReturn = FunctionReturn<typeof functions.bufferedDeposits>

export type BufferedRedeemsParams = FunctionArguments<typeof functions.bufferedRedeems>
export type BufferedRedeemsReturn = FunctionReturn<typeof functions.bufferedRedeems>

export type ClaimUnbondedParams = FunctionArguments<typeof functions.claimUnbonded>
export type ClaimUnbondedReturn = FunctionReturn<typeof functions.claimUnbonded>

export type DecimalsParams = FunctionArguments<typeof functions.decimals>
export type DecimalsReturn = FunctionReturn<typeof functions.decimals>

export type DecreaseAllowanceParams = FunctionArguments<typeof functions.decreaseAllowance>
export type DecreaseAllowanceReturn = FunctionReturn<typeof functions.decreaseAllowance>

export type DepositParams_0 = FunctionArguments<typeof functions['deposit(uint256,address)']>
export type DepositReturn_0 = FunctionReturn<typeof functions['deposit(uint256,address)']>

export type DepositParams_1 = FunctionArguments<typeof functions['deposit(uint256)']>
export type DepositReturn_1 = FunctionReturn<typeof functions['deposit(uint256)']>

export type DepositCapParams = FunctionArguments<typeof functions.depositCap>
export type DepositCapReturn = FunctionReturn<typeof functions.depositCap>

export type DisableLedgerParams = FunctionArguments<typeof functions.disableLedger>
export type DisableLedgerReturn = FunctionReturn<typeof functions.disableLedger>

export type DistributeLossesParams = FunctionArguments<typeof functions.distributeLosses>
export type DistributeLossesReturn = FunctionReturn<typeof functions.distributeLosses>

export type DistributeRewardsParams = FunctionArguments<typeof functions.distributeRewards>
export type DistributeRewardsReturn = FunctionReturn<typeof functions.distributeRewards>

export type EmergencyPauseLedgerParams = FunctionArguments<typeof functions.emergencyPauseLedger>
export type EmergencyPauseLedgerReturn = FunctionReturn<typeof functions.emergencyPauseLedger>

export type FindLedgerParams = FunctionArguments<typeof functions.findLedger>
export type FindLedgerReturn = FunctionReturn<typeof functions.findLedger>

export type FlushStakesParams = FunctionArguments<typeof functions.flushStakes>
export type FlushStakesReturn = FunctionReturn<typeof functions.flushStakes>

export type FundRaisedBalanceParams = FunctionArguments<typeof functions.fundRaisedBalance>
export type FundRaisedBalanceReturn = FunctionReturn<typeof functions.fundRaisedBalance>

export type GetLedgerAddressesParams = FunctionArguments<typeof functions.getLedgerAddresses>
export type GetLedgerAddressesReturn = FunctionReturn<typeof functions.getLedgerAddresses>

export type GetPooledTokenBySharesParams = FunctionArguments<typeof functions.getPooledTokenByShares>
export type GetPooledTokenBySharesReturn = FunctionReturn<typeof functions.getPooledTokenByShares>

export type GetSharesByPooledTokenParams = FunctionArguments<typeof functions.getSharesByPooledToken>
export type GetSharesByPooledTokenReturn = FunctionReturn<typeof functions.getSharesByPooledToken>

export type GetStashAccountsParams = FunctionArguments<typeof functions.getStashAccounts>
export type GetStashAccountsReturn = FunctionReturn<typeof functions.getStashAccounts>

export type GetTotalPooledTokenParams = FunctionArguments<typeof functions.getTotalPooledToken>
export type GetTotalPooledTokenReturn = FunctionReturn<typeof functions.getTotalPooledToken>

export type GetUnbondedParams = FunctionArguments<typeof functions.getUnbonded>
export type GetUnbondedReturn = FunctionReturn<typeof functions.getUnbonded>

export type IncreaseAllowanceParams = FunctionArguments<typeof functions.increaseAllowance>
export type IncreaseAllowanceReturn = FunctionReturn<typeof functions.increaseAllowance>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type LedgerBorrowParams = FunctionArguments<typeof functions.ledgerBorrow>
export type LedgerBorrowReturn = FunctionReturn<typeof functions.ledgerBorrow>

export type LedgerStakeParams = FunctionArguments<typeof functions.ledgerStake>
export type LedgerStakeReturn = FunctionReturn<typeof functions.ledgerStake>

export type NameParams = FunctionArguments<typeof functions.name>
export type NameReturn = FunctionReturn<typeof functions.name>

export type NominateBatchParams = FunctionArguments<typeof functions.nominateBatch>
export type NominateBatchReturn = FunctionReturn<typeof functions.nominateBatch>

export type PauseParams = FunctionArguments<typeof functions.pause>
export type PauseReturn = FunctionReturn<typeof functions.pause>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type RedeemParams = FunctionArguments<typeof functions.redeem>
export type RedeemReturn = FunctionReturn<typeof functions.redeem>

export type RemoveLedgerParams = FunctionArguments<typeof functions.removeLedger>
export type RemoveLedgerReturn = FunctionReturn<typeof functions.removeLedger>

export type ResumeParams = FunctionArguments<typeof functions.resume>
export type ResumeReturn = FunctionReturn<typeof functions.resume>

export type ResumeLedgerParams = FunctionArguments<typeof functions.resumeLedger>
export type ResumeLedgerReturn = FunctionReturn<typeof functions.resumeLedger>

export type SetDepositCapParams = FunctionArguments<typeof functions.setDepositCap>
export type SetDepositCapReturn = FunctionReturn<typeof functions.setDepositCap>

export type SetDevelopersTreasuryParams = FunctionArguments<typeof functions.setDevelopersTreasury>
export type SetDevelopersTreasuryReturn = FunctionReturn<typeof functions.setDevelopersTreasury>

export type SetFeeParams = FunctionArguments<typeof functions.setFee>
export type SetFeeReturn = FunctionReturn<typeof functions.setFee>

export type SetLedgerBeaconParams = FunctionArguments<typeof functions.setLedgerBeacon>
export type SetLedgerBeaconReturn = FunctionReturn<typeof functions.setLedgerBeacon>

export type SetLedgerFactoryParams = FunctionArguments<typeof functions.setLedgerFactory>
export type SetLedgerFactoryReturn = FunctionReturn<typeof functions.setLedgerFactory>

export type SetMaxAllowableDifferenceParams = FunctionArguments<typeof functions.setMaxAllowableDifference>
export type SetMaxAllowableDifferenceReturn = FunctionReturn<typeof functions.setMaxAllowableDifference>

export type SetRelaySpecParams = FunctionArguments<typeof functions.setRelaySpec>
export type SetRelaySpecReturn = FunctionReturn<typeof functions.setRelaySpec>

export type SymbolParams = FunctionArguments<typeof functions.symbol>
export type SymbolReturn = FunctionReturn<typeof functions.symbol>

export type TotalSupplyParams = FunctionArguments<typeof functions.totalSupply>
export type TotalSupplyReturn = FunctionReturn<typeof functions.totalSupply>

export type TransferParams = FunctionArguments<typeof functions.transfer>
export type TransferReturn = FunctionReturn<typeof functions.transfer>

export type TransferFromParams = FunctionArguments<typeof functions.transferFrom>
export type TransferFromReturn = FunctionReturn<typeof functions.transferFrom>

export type TransferFromLedgerParams = FunctionArguments<typeof functions.transferFromLedger>
export type TransferFromLedgerReturn = FunctionReturn<typeof functions.transferFromLedger>

export type TransferToLedgerParams = FunctionArguments<typeof functions.transferToLedger>
export type TransferToLedgerReturn = FunctionReturn<typeof functions.transferToLedger>

