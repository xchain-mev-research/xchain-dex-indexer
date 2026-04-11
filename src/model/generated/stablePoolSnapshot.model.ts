import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, BigDecimalColumn as BigDecimalColumn_, OneToMany as OneToMany_, BooleanColumn as BooleanColumn_} from "@subsquid/typeorm-store"
import {StablePool} from "./stablePool.model"
import {StablePoolSnapshotCoinBalance} from "./stablePoolSnapshotCoinBalance.model"

@Entity_()
export class StablePoolSnapshot {
    constructor(props?: Partial<StablePoolSnapshot>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => StablePool, {nullable: true})
    pool!: StablePool

    @IntColumn_({nullable: false})
    blockNumber!: number

    @StringColumn_({nullable: true})
    afterTxId!: string | undefined | null

    @IntColumn_({nullable: true})
    index!: number | undefined | null

    /**
     * Priority of the transaction or operation for placement in the block:
     * - EVM: priorityFee + baseFee
     * - Substrate: tip + weightFee
     */
    @BigIntColumn_({nullable: true})
    priorityInclusionFeePerUnit!: bigint | undefined | null

    /**
     *  Amplification coefficient multiplied by n * (n - 1) 
     */
    @BigIntColumn_({nullable: false})
    a!: bigint

    @BigIntColumn_({nullable: false})
    initialA!: bigint

    @BigIntColumn_({nullable: false})
    futureA!: bigint

    @BigIntColumn_({nullable: false})
    initialATime!: bigint

    @BigIntColumn_({nullable: false})
    futureATime!: bigint

    /**
     *  Fee to charge for exchanges 
     */
    @BigIntColumn_({nullable: false})
    fee!: bigint

    /**
     *  Average dollar value of pool token 
     */
    @BigDecimalColumn_({nullable: false})
    virtualPrice!: BigDecimal

    /**
     *  Pool balance of coins 
     */
    @OneToMany_(() => StablePoolSnapshotCoinBalance, e => e.poolSnapshot)
    coins!: StablePoolSnapshotCoinBalance[]

    /**
     *  The pool is paused and it can't be used for exchanges 
     */
    @BooleanColumn_({nullable: false})
    paused!: boolean
}
