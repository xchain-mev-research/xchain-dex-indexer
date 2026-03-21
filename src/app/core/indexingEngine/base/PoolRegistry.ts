
export class PoolRegistry<PoolEntity extends { id: string }> {

    private knownPools: Map<string, PoolEntity>;
    private newPools: PoolEntity[] = [];

    constructor(initialPools?: Map<string, PoolEntity>) {
        this.knownPools = initialPools ?? new Map();
    }

    /**
     * Registers a new pool, if not already tracked.
     */
    add(pool: PoolEntity): void {
        const key = pool.id.toLowerCase();
        if (!this.knownPools.has(key)) {
            this.knownPools.set(key, pool);
            this.newPools.push(pool);
        }
    }

    /**
     * Returns true if the pool is already tracked.
     */
    has(poolId: string): boolean {
        return this.knownPools.has(poolId.toLowerCase());
    }

    /**
     * Returns a tracked pool by ID, or undefined if not found.
     */
    get(poolId: string): PoolEntity | undefined {
        return this.knownPools.get(poolId.toLowerCase());
    }

    /**
     * Returns all tracked pools (both pre-existing and newly added).
     */
    getAll(): Map<string, PoolEntity> {
        return this.knownPools;
    }

    /**
     * Returns only the pools added during the current batch run.
     */
    getNew(): PoolEntity[] {
        return this.newPools;
    }

    /**
     * Clears the new-pools list after they have been inserted into the database.
     */
    clearNew(): void {
        this.newPools = [];
    }
}
