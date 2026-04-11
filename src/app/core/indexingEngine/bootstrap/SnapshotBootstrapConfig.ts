export interface ISnapshotBootstrapConfig {
    subgraphUrl: string;
    subgraphQuery: string;
    /**
     * True for Algebra forks (e.g. StellaSwap V3/V4) where `fee` is a dynamic
     * per-snapshot value and must be stored on the snapshot entity.
     * False for Uniswap V3 forks (e.g. Beamswap V3) where `fee` is the static
     * pool-level feeTier and is only stored on the pool entity.
     */
    isAlgebraFee?: boolean;
}
