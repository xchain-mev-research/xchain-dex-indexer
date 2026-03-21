import { CrossChainAssetRegistryManager } from "../CrossChainAssetRegistryManager";

import * as xcmRegistry from "../xcmRegistry/generated/polkadot_xcmRegistry.json";
import { CrossChainAssetRegistry } from "../xcmRegistry/XcmRegistryInterface";

const registry: CrossChainAssetRegistry = xcmRegistry;
const crossChainAssetRegistryInstance = new CrossChainAssetRegistryManager(registry);

export { crossChainAssetRegistryInstance };

