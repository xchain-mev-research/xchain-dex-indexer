import { ParachainInfo } from "../parachainUtils/ParachainConst";
import { CrossChainAssetRegistryManager, ParachainWhiteList, WhitelistItem } from "./CrossChainAssetRegistryManager";
import { CrossChainAssetItem } from "./xcmRegistry/XcmRegistryInterface";

export class ParachainAssetRegistryManager {

    private crossChainManager: CrossChainAssetRegistryManager;
    private parachainInfo: ParachainInfo;

    constructor(crossChainManager: CrossChainAssetRegistryManager, parachainInfo: ParachainInfo) {
        this.crossChainManager = crossChainManager;
        this.parachainInfo = parachainInfo;
    }

    public getByEvmAddress(evmAddress: string): CrossChainAssetItem | undefined {
        return this.crossChainManager.getByEvmAddress(this.parachainInfo, evmAddress);
    }

    public getBySubstrateId(substrateId: any): CrossChainAssetItem | undefined {
        return this.crossChainManager.getBySubstrateId(this.parachainInfo, substrateId);
    }

    public getAssetsByWhitelist(whitelist: ParachainWhiteList[]): CrossChainAssetItem[] {
        const filtered = whitelist.filter(item => item.parachain.id === this.parachainInfo.id);
        return this.crossChainManager.getAssetsCommonInWhitelists(filtered);
    }

    public getAllAssets(): CrossChainAssetItem[] {
        return Object.values(this.crossChainManager.getAssetsCommonToChains([this.parachainInfo]));
    }

    public hasAsset(evmAddressOrSubstrateId: any): boolean {
        return !!this.getByEvmAddress(evmAddressOrSubstrateId) || !!this.getBySubstrateId(evmAddressOrSubstrateId);
    }

    public getAssetsCommonWithChains(parachainsInfos: ParachainInfo[]): CrossChainAssetItem[] {
        const allChains = [this.parachainInfo, ...parachainsInfos];
        return this.crossChainManager.getAssetsCommonToChains(allChains);
    }

}