import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, BigDecimalColumn as BigDecimalColumn_} from "@subsquid/typeorm-store"
import {V2Pool} from "./v2Pool.model"

@Entity_()
export class V2PoolSnapshot {
    constructor(props?: Partial<V2PoolSnapshot>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => V2Pool, {nullable: true})
    pool!: V2Pool

    @IntColumn_({nullable: false})
    blockNumber!: number

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

    @BigDecimalColumn_({nullable: false})
    reserve0!: BigDecimal

    @BigDecimalColumn_({nullable: false})
    reserve1!: BigDecimal

    @BigDecimalColumn_({nullable: false})
    token0Price!: BigDecimal

    @BigDecimalColumn_({nullable: false})
    token1Price!: BigDecimal
}
