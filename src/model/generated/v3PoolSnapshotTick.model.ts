import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {V3PoolSnapshot} from "./v3PoolSnapshot.model"

@Entity_()
export class V3PoolSnapshotTick {
    constructor(props?: Partial<V3PoolSnapshotTick>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => V3PoolSnapshot, {nullable: true})
    poolSnapshot!: V3PoolSnapshot

    @BigIntColumn_({nullable: false})
    tickIdx!: bigint

    @BigIntColumn_({nullable: false})
    liquidityGross!: bigint

    @BigIntColumn_({nullable: false})
    liquidityNet!: bigint
}
