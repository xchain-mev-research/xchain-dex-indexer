import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {StablePoolSnapshot} from "./stablePoolSnapshot.model"
import {StablePoolCoin} from "./stablePoolCoin.model"

@Entity_()
export class StablePoolSnapshotCoinBalance {
    constructor(props?: Partial<StablePoolSnapshotCoinBalance>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => StablePoolSnapshot, {nullable: true})
    poolSnapshot!: StablePoolSnapshot

    @Index_()
    @ManyToOne_(() => StablePoolCoin, {nullable: true})
    coin!: StablePoolCoin

    /**
     *  Pool balance of these coin 
     */
    @BigIntColumn_({nullable: false})
    balance!: bigint
}
