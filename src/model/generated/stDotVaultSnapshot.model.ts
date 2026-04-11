import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BooleanColumn as BooleanColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, BigDecimalColumn as BigDecimalColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class StDotVaultSnapshot {
    constructor(props?: Partial<StDotVaultSnapshot>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    blockNumber!: number

    @BooleanColumn_({nullable: false})
    paused!: boolean

    @StringColumn_({nullable: true})
    afterTxId!: string | undefined | null

    /**
     * Priority of the transaction or operation for placement in the block:
     * - EVM: priorityFee + baseFee
     * - Substrate: tip + weightFee
     */
    @BigIntColumn_({nullable: true})
    priorityInclusionFeePerUnit!: bigint | undefined | null

    @IntColumn_({nullable: true})
    index!: number | undefined | null

    @BigIntColumn_({nullable: false})
    totalDot!: bigint

    @BigIntColumn_({nullable: false})
    totalStDot!: bigint

    @BigDecimalColumn_({nullable: false})
    exchangeRate!: BigDecimal

    @IntColumn_({nullable: false})
    fee!: number

    @IntColumn_({nullable: false})
    feeTreasuryBP!: number

    @IntColumn_({nullable: false})
    feeDevelopersBP!: number
}
