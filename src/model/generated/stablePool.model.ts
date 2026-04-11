import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {DexType} from "./_dexType"
import {StablePoolCoin} from "./stablePoolCoin.model"

@Entity_()
export class StablePool {
    constructor(props?: Partial<StablePool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    createdAtBlockNumber!: number

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @Column_("varchar", {length: 21, nullable: false})
    dex!: DexType

    /**
     *  Number of coins composing the pool 
     */
    @IntColumn_({nullable: false})
    coinCount!: number

    /**
     *  List of coins that compose the pool 
     */
    @OneToMany_(() => StablePoolCoin, e => e.pool)
    coins!: StablePoolCoin[]
}
