import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {Token} from "./token.model"
import {DexType} from "./_dexType"

@Entity_()
export class V2Pool {
    constructor(props?: Partial<V2Pool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    createdAtBlockNumber!: number

    @DateTimeColumn_({nullable: true})
    createdAt!: Date | undefined | null

    @Index_()
    @ManyToOne_(() => Token, {nullable: true})
    token0!: Token

    @Index_()
    @ManyToOne_(() => Token, {nullable: true})
    token1!: Token

    @Column_("varchar", {length: 21, nullable: false})
    dex!: DexType
}
