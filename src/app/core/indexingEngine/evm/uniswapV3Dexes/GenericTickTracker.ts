import { V3PoolSnapshot, V4PoolSnapshot } from "@model/generated";

export interface ITick {
    id: string;
    poolSnapshot: V3PoolSnapshot | V4PoolSnapshot;
    tickIdx: bigint;
    liquidityGross: bigint;
    liquidityNet: bigint;
}

export class GenericTickTracker<T extends ITick> {

    private tickMap: Map<string, { tick: T, ignore?: boolean }> = new Map();
    private ctor: new (args: ITick) => T;

    constructor(ctor: new (args: any) => T) {
        this.ctor = ctor;
    }

    track(...ticks: T[]) {
        for (const tick of ticks) {
            const tickClone = this.clone(tick);
            this.tickMap.set(tick.id, { tick: tickClone });
        }
    }

    trackInMemory(...ticks: T[]) {
        for (const tick of ticks) {
            const tickClone = this.clone(tick);
            this.tickMap.set(tick.id, { tick: tickClone, ignore: true });
        }
    }

    private clone(tick: T) {
        return new this.ctor({
            id: tick.id,
            tickIdx: tick.tickIdx,
            liquidityGross: tick.liquidityGross,
            liquidityNet: tick.liquidityNet,
            poolSnapshot: tick.poolSnapshot
        });
    }

    getInMemoryMap(): Map<string, T> {
        const inMemoryMap = new Map<string, T>();
        for (const [key, value] of this.tickMap.entries()) {
            if (!value.ignore)
                inMemoryMap.set(key, value.tick);
        }

        return inMemoryMap;
    }

    getAllTicks(): T[] {
        return Array.from(this.tickMap.values())
            .filter(item => !item.ignore)
            .map(item => item.tick)
            ;
    }

    clear() {
        this.tickMap.clear();
    }
}
