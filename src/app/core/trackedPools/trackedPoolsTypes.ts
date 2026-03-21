
// This file is used to aggreagte tracked pools from the different sources,
// using interfaces that are used to define the structure of the pools.

export class IgnoreCaseMap<T> extends Map<string, T> {
    constructor() {
        super();
    }

    has(key: string): boolean {
        return super.has(key.toLowerCase());
    }

    get(key: string): T | undefined {
        return super.get(key.toLowerCase());
    }
    set(key: string, value: T): this {
        return super.set(key.toLowerCase(), value);
    }

}

export class TrackedPoolsMap<T extends ITrackedV2Pool | ITrackedV3Pool | ITrackedStablePool> extends IgnoreCaseMap<T> {
    constructor() {
        super();
    }
    populate(pools: Array<T>): void {
        pools.forEach(pool => this.set(pool.id, pool));
    }
}


export interface HasId {
    id: string;
}

export interface ITrackedToken extends HasId {
    symbol: string;
    name: string;
    decimals: number | string;
}

export interface ITrackedPair extends HasId {
    token0: ITrackedToken;
    token1: ITrackedToken;
}

export interface ITrackedV2Pool extends ITrackedPair {
    reserveUSD: string;
}

export interface ITrackedV3Pool extends ITrackedPair {
    totalValueLockedUSD: string;
}

export interface ITrackedV4Pool extends ITrackedV3Pool {
}

export interface ITrackedStablePool extends HasId {
    createdAtBlockNumber: number;
    createdAtTimestamp: bigint;

    totalValueLockedUSD: string;
    tokens: ITrackedToken[];

}



