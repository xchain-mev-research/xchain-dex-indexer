import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, BigDecimalColumn as BigDecimalColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {V4Pool} from "./v4Pool.model"
import {V4PoolSnapshotTick} from "./v4PoolSnapshotTick.model"

@Entity_()
export class V4PoolSnapshot {
    constructor(props?: Partial<V4PoolSnapshot>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => V4Pool, {nullable: true})
    pool!: V4Pool

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

    @BigIntColumn_({nullable: true})
    fee!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    pluginFee!: bigint | undefined | null

    @BigIntColumn_({nullable: false})
    liquidity!: bigint

    @BigIntColumn_({nullable: false})
    sqrtPrice!: bigint

    @IntColumn_({nullable: true})
    tick!: number | undefined | null

    @BigDecimalColumn_({nullable: false})
    token0Price!: BigDecimal

    @BigDecimalColumn_({nullable: false})
    token1Price!: BigDecimal

    @OneToMany_(() => V4PoolSnapshotTick, e => e.poolSnapshot)
    ticks!: V4PoolSnapshotTick[]
}
