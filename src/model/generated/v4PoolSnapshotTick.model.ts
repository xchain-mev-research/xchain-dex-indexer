import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {V4PoolSnapshot} from "./v4PoolSnapshot.model"

@Entity_()
export class V4PoolSnapshotTick {
    constructor(props?: Partial<V4PoolSnapshotTick>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => V4PoolSnapshot, {nullable: true})
    poolSnapshot!: V4PoolSnapshot

    @BigIntColumn_({nullable: false})
    tickIdx!: bigint

    @BigIntColumn_({nullable: false})
    liquidityGross!: bigint

    @BigIntColumn_({nullable: false})
    liquidityNet!: bigint
}
