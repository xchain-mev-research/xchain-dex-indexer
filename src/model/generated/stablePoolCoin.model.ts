import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {StablePool} from "./stablePool.model"
import {Token} from "./token.model"

@Entity_()
export class StablePoolCoin {
    constructor(props?: Partial<StablePoolCoin>) {
        Object.assign(this, props)
    }

    /**
     *  Format: <pool_id>-<coin_index> 
     */
    @PrimaryColumn_()
    id!: string

    /**
     *  Coin index 
     */
    @IntColumn_({nullable: false})
    index!: number

    @Index_()
    @ManyToOne_(() => StablePool, {nullable: true})
    pool!: StablePool

    @Index_()
    @ManyToOne_(() => Token, {nullable: true})
    token!: Token
}
