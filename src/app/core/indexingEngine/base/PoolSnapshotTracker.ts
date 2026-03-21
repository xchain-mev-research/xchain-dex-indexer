
import { Entity } from '@subsquid/typeorm-store/lib/store';

export class PoolSnapshotTracker<PoolSnapshotType extends Entity & { pool: { id: string } }> {

    // In-memory map of the latest snapshot per pool (not persisted directly)
    private snapshotsMap: Map<string, PoolSnapshotType> = new Map();

    constructor(snapshotsMap?: Map<string, PoolSnapshotType>) {
        this.snapshotsMap = snapshotsMap ?? new Map();
    }

    /**
     * Updates the latest snapshot for a pool.
     */
    track(poolSnapshot: PoolSnapshotType): void {
        this.snapshotsMap.set(poolSnapshot.pool.id.toLowerCase(), poolSnapshot);
    }

    /**
     * Returns a clone of the latest snapshot for the given pool, or undefined if not tracked.
     */
    getLatest(poolId: string): PoolSnapshotType | undefined {
        const original = this.snapshotsMap.get(poolId.toLowerCase());
        if (!original) 
            return undefined;
        
        return this._clone(original);
    }

    /**
     * Generates end-of-block snapshots for all tracked pools at the given block height.
     */
    createEndBlockSnapshots(blockHeight: number, toBlockPoolSnapshot: (poolSnapshot: PoolSnapshotType, blockHeight: number)
        => PoolSnapshotType): PoolSnapshotType[] {
        const snapshots: PoolSnapshotType[] = [];

        for (const poolSnapshot of this.snapshotsMap.values())
            snapshots.push(toBlockPoolSnapshot(this._clone(poolSnapshot), blockHeight));

        return snapshots;

    }

    /**
     * Returns the internal snapshot map (for debugging or advanced use).
     */
    getAll(): Map<string, PoolSnapshotType> {
        return this.snapshotsMap;
    }

    /**
     * Clears all tracked snapshots.
     */
    clear(): void {
        this.snapshotsMap.clear();
    }

    private _clone<T extends object>(original: T): T {
        return Object.assign(Object.create(Object.getPrototypeOf(original)), original) as T;
    }

}