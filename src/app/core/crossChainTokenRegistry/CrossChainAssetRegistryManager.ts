import { logger } from "../log/logger";
import { Parachain, ParachainInfo } from "../parachainUtils/ParachainConst";
import { CrossChainAssetItem, CrossChainAssetRegistry } from "./xcmRegistry/XcmRegistryInterface";

// Registry managment for parachain assets
interface PerParachainMapping {
    evmAddressAssetMap: Record<string, CrossChainAssetItem>;
    substrateIdAssetMap: Record<string, CrossChainAssetItem>;
}

export interface ParachainWhiteList {
    parachain: ParachainInfo;
    whitelist: WhitelistItem[];
}
export interface WhitelistItem {
    symbol?: string;
    name?: string;
    evmAddress?: string;
    substrateId?: any;
}


/**
 * Represents the registry of all canonical tokens across chains.
 */
export class CrossChainAssetRegistryManager {

    private registry: CrossChainAssetRegistry;
    private parachainMap: Record<string, PerParachainMapping> = {};

    constructor(registry: CrossChainAssetRegistry) {
        _patchMissingInfo(registry);
        this.registry = registry;
        this._buildIndex();
    }

    private _buildIndex() {
        for (const asset of Object.values(this.registry)) {
            // asset: CrossChainAssetItem
            const relatedParachains = this._collectParachains(asset);

            for (const parachainId of relatedParachains) {
                this._ensureParachainInitialized(parachainId);

                const mappings: PerParachainMapping = this.parachainMap[parachainId];

                const evmAddress = asset.xcContractAddress?.[parachainId];
                if (evmAddress) {
                    mappings.evmAddressAssetMap[evmAddress.toLowerCase()] = asset;
                }

                const substrateId = asset.xcCurrencyID?.[parachainId];
                if (substrateId) {
                    mappings.substrateIdAssetMap[JSON.stringify(substrateId)] = asset;
                }
            }
        }
    }

    private _collectParachains(asset: CrossChainAssetItem): Set<string> {
        const parachains = new Set<string>();
        if (asset.paraID)
            parachains.add(asset.paraID.toString());

        if (asset.xcContractAddress) {
            for (const parachainId of Object.keys(asset.xcContractAddress))
                parachains.add(parachainId);
        }

        if (asset.xcCurrencyID) {
            for (const parachainId of Object.keys(asset.xcCurrencyID))
                parachains.add(parachainId);
        }

        return parachains;
    }

    private _ensureParachainInitialized(parachainId: string) {
        if (!this.parachainMap[parachainId])
            this.parachainMap[parachainId] = { evmAddressAssetMap: {}, substrateIdAssetMap: {} };
    }

    /**
     * Returns all assets that are present in at least one of the given parachain whitelists.
     * @param whitelists - Array of ParachainWhiteList.
     * @returns Array of CrossChainAssetItem present in at least one whitelist.
     */
    public getAssetsInAnyWhitelist(whitelists: ParachainWhiteList[]): CrossChainAssetItem[] {
        const foundAssets = new Set<CrossChainAssetItem>();

        for (const parachainWhitelist of whitelists) {
            const parachain = parachainWhitelist.parachain;

            for (const item of parachainWhitelist.whitelist) {
                const asset = this.getByEvmAddressOrSubstrateId(parachain, item);
                if (asset) {
                    foundAssets.add(asset);
                }
            }
        }

        return Array.from(foundAssets);
    }

    /**
     * Returns all assets that are in the given whitelist.
     * @param whitelist - Array of WhitelistItem objects.
     * @returns Array of CrossChainAssetItem objects that are in the given whitelist.
     */
    public getAssetsCommonInWhitelists(whitelists: ParachainWhiteList[]): CrossChainAssetItem[] {
        var commonAssets: CrossChainAssetItem[] = this.getAssetsCommonToChains(whitelists.map(item => item.parachain));

        return commonAssets.filter(asset => this._isAssetInAllWhitelists(asset, whitelists));
    }

    private _isAssetInAllWhitelists(asset: CrossChainAssetItem, whitelists: ParachainWhiteList[]): boolean {
        var result = true;

        for (const parachainWhitelist of whitelists) {
            var whiteList: WhitelistItem[] = parachainWhitelist.whitelist;
            var isInWhiteList = whiteList.some((item) => {
                return this.getByEvmAddressOrSubstrateId(parachainWhitelist.parachain, item) === asset;
            });

            if (!isInWhiteList) {
                result = false;
                logger.info(`[WHITELIST CHECK] Missing asset ${asset.symbol} on parachain ${parachainWhitelist.parachain.name}`);
            }
        }

        return result;
    }

    public isAllWhitelistXcmTransferable(parachainWhitelist: ParachainWhiteList): boolean {
        var parachain = parachainWhitelist.parachain;

        for (const whitelistItem of parachainWhitelist.whitelist) {
            const asset = this.getByEvmAddressOrSubstrateId(parachain, whitelistItem);
            if (!asset) {
                logger.info(`[WHITELIST CHECK] Missing asset ${whitelistItem.symbol} on parachain ${parachain.name} - Address ${whitelistItem.evmAddress} - SubstrateId ${whitelistItem.substrateId}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Returns all assets that are common to the given parachains.
     * @param ParachainInfo - Array of parachain info.
     * @returns Array of CrossChainAssetItem objects that are common to the given parachains.
     */
    public getAssetsCommonToChains(parachainsInfo: ParachainInfo[]): CrossChainAssetItem[] {
        const result: CrossChainAssetItem[] = [];

        for (const asset of Object.values(this.registry)) {
            const assetParachains: Set<string> = this._collectParachains(asset);

            const hasAllChains = parachainsInfo.every(parachain => assetParachains.has(parachain.id.toString()));
            if (hasAllChains)
                result.push(asset);
        }

        return result;
    }

    public getByEvmAddress(parachainsInfo: ParachainInfo, evmAddress: string): CrossChainAssetItem | undefined {
        return this.parachainMap[parachainsInfo.id.toString()]?.evmAddressAssetMap[evmAddress.toLowerCase()];
    }

    public getBySubstrateId(parachainsInfo: ParachainInfo, substrateId: any): CrossChainAssetItem | undefined {
        return this.parachainMap[parachainsInfo.id.toString()]?.substrateIdAssetMap[JSON.stringify(substrateId)];
    }

    public getByEvmAddressOrSubstrateId(parachain: ParachainInfo, item: WhitelistItem): CrossChainAssetItem | undefined {
        if (item.evmAddress)
            return this.getByEvmAddress(parachain, item.evmAddress);

        return this.getBySubstrateId(parachain, item.substrateId);
    }

    public getAllParachains(): string[] {
        return Object.keys(this.parachainMap);
    }

    /**
     * Returns all tokens in the registry.
     */
    public getAllTokens(): CrossChainAssetItem[] {
        return Object.values(this.registry);
    }

    /**
     * Returns a token by its canonical ID, or null if not found.
     */
    public getTokenByCanonicalId(canonicalId: string): CrossChainAssetItem | null {
        return this.registry[canonicalId] || null;
    }

    public hasAsset(canonicalId: string): boolean {
        return !!this.registry[canonicalId];
    }

    public parachainHasAsset(canonicalId: string, parachain: ParachainInfo): boolean {
        const asset = this.registry[canonicalId];
        if (!asset)
            return false;

        if (asset.xcContractAddress && asset.xcContractAddress[parachain.id])
            return true;

        if (asset.xcCurrencyID && asset.xcCurrencyID[parachain.id])
            return true;

        return false;
    }

    /**
     * Serializes the registry to JSON.
     */
    public toJSON(): any {
        return JSON.stringify(this.registry);
    }

}

function _patchMissingInfo(registry: CrossChainAssetRegistry): void {
    _patchMoonbeamMissingContracts(registry);
}

/**
 * Patches missing xcContractAddress[2004] for Moonbeam-native assets.
 * Extracts the accountKey20 value from xcmV1Standardized when the EVM address is absent.
 */
function _patchMoonbeamMissingContracts(registry: CrossChainAssetRegistry): void {
    var moonbeamId = Parachain.Moonbeam.id;
    const moonbeamIdStr = moonbeamId.toString();

    // add GLMR wrapper evm contract
    var glmrItem = registry["[{\"network\":\"polkadot\"},{\"parachain\":2004},{\"palletInstance\":10}]"];
    glmrItem.xcContractAddress![moonbeamIdStr] = "0xacc15dc74880c9944775448304b263d191c6077f";

    for (const asset of Object.values(registry)) {
        // Check if the asset is native to Moonbeam and lacks an EVM address mapping
        const isMoonbeamNative = asset.paraID === moonbeamId;
        const hasMoonbeamEvmMapping = asset.xcContractAddress?.[moonbeamIdStr];

        if (isMoonbeamNative && !hasMoonbeamEvmMapping) {
            const accountKey20 = asset.xcmV1Standardized.find(
                (entry) => "accountKey20" in entry
            )?.accountKey20;

            if (accountKey20?.key) {
                if (!asset.xcContractAddress) {
                    asset.xcContractAddress = {};
                }

                asset.xcContractAddress[moonbeamIdStr] = accountKey20.key.toLowerCase();
            }
        }
    }
}

