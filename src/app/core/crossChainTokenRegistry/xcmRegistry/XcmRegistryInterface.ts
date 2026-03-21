
// ==========================================================================
// =============== CROSS-CHAIN ASSET REGISTRY INTERFACES ====================
// ==========================================================================

// Registry Map: MultiLocation -> CrossChainAssetItem
interface CrossChainAssetRegistry {
    [xcmMultiLocationSerialized: string]: CrossChainAssetItem;
}

interface CrossChainAssetItem {
    relayChain: string;
    paraID?: number;

    nativeChainID: string | null;
    symbol: string;
    decimals: number;

    interiorType: string;

    xcmV1Standardized: any[];
    xcmV1MultiLocation: { v1: any };

    xcContractAddress?: Record<string, string>;
    xcCurrencyID?: Record<string, any>;

    confidence?: number;
    source?: number[];
}

/*
type XcmStandardizedLocation =
    | { network?: string; parachain?: number;[key: string]: any }
    | string;

/**
 * MultiLocation representation of an asset (used in XCM).
 */

/*
type XcmLocation = {
    parents: number;
    interior:
    | { here: null }
    | { x1: Junction[] }
    | { x2: Junction[] }
    | { x3: Junction[] }
    | { x4: Junction[] };
};


/**
 * Junction components of a MultiLocation path.
 */
/*
type Junction =
    | { parachain: number }
    | { palletInstance: number }
    | { generalIndex: number }
    | { generalKey: { length: number; data: string } }
    | { accountKey20: { network: string | null; key: string } }
    | { accountId32: { network: string | null; id: string } }
    | { assetInstance: { Undefined: null } }
    | { globalConsensus: { [network: string]: { chainId: number } } }
    | { onlyChild: null };

*/

export type { CrossChainAssetRegistry, CrossChainAssetItem };