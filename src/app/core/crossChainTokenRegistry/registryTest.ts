import { MOONBEAM_WHITE_LIST_TOKENS } from "@app/chains/moonbeam/trackedItems/whiteListTokens/whiteListTokensConst";
import { logger } from "../log/logger";
import { Parachain, ParachainInfo } from "../parachainUtils/ParachainConst";
import { ParachainWhiteList } from "./CrossChainAssetRegistryManager";
import { crossChainAssetRegistryInstance } from "./instance/crossChainAssetRegistryManager";
import { CrossChainAssetItem } from "./xcmRegistry/XcmRegistryInterface";



function main() {

    var moonbeamWhitelist: ParachainWhiteList = {
        parachain: Parachain.Moonbeam,
        whitelist: MOONBEAM_WHITE_LIST_TOKENS.map((item) => {
            return {
                evmAddress: item.id,
                symbol: item.symbol,
                name: item.name,
            }
        })
    };

    var hydraWhitelist: ParachainWhiteList = {
        parachain: Parachain.Hydration,
        whitelist: [
            {
                substrateId: "16"
            },
            {
                substrateId: "15"
            },
            {
                substrateId: "3"
            }
        ]
    };


    //  checkAllWhitelistIsTransferable(moonbeamWhitelist);

    // logAssetsCommonInWhitelists([moonbeamWhitelist, hydraWhitelist], printIfMissedOn);

    logListToManualCheck(Parachain.Hydration, [moonbeamWhitelist]);


    var chains = [Parachain.Moonbeam, Parachain.Hydration];
    // logCommonAssets(chains);

}


function logListToManualCheck(parachainToCheck: ParachainInfo, parachainWhiteLists: ParachainWhiteList[]) {
    // Example: if a token is listed in the Moonbeam whitelist, its representation on Hydra
    // is automatically assumed to be whitelisted as well. Otherwise it must be checked manually.
    // We take all tokens whitelisted on Moonbeam.

    var allWhitelistedItems = crossChainAssetRegistryInstance.getAssetsInAnyWhitelist(parachainWhiteLists);

    for (var asset of allWhitelistedItems) {
        // Check whether the asset exists in the parachain we want to verify
        var maybeAssetId =
            asset.xcCurrencyID?.[parachainToCheck.id]
            ??
            asset.xcContractAddress?.[parachainToCheck.id];

        if (!maybeAssetId) {
            logger.info("Asset to manual check: ", asset.symbol);
        }

    }
}

function checkAllWhitelistIsTransferable(parachainWhitelist: ParachainWhiteList) {

    var isValid = crossChainAssetRegistryInstance.isAllWhitelistXcmTransferable(parachainWhitelist);

    if (isValid) {
        logger.info("Whitelist is valid");
    } else {
        logger.info("Whitelist is NOT all valid");
    }
}

function logAssetsCommonInWhitelists(parachainWhitelist: ParachainWhiteList[], printOnlyParachain?: ParachainInfo) {
    // Not all listed assets can be transferred across chains.
    // Some exist only as smart contracts and are not transferable to other parachains.
    var whiteListCrossChainAssets = crossChainAssetRegistryInstance.getAssetsCommonInWhitelists(parachainWhitelist);
    logger.info("Result whiteList CrossChainAssets: ", whiteListCrossChainAssets.length);

    for (var asset of whiteListCrossChainAssets) {
        logger.info("Asset: ", asset.symbol);
    }
}

function logCommonAssets(chains: ParachainInfo[]) {
    var commonAssets: CrossChainAssetItem[] = crossChainAssetRegistryInstance.getAssetsCommonToChains(chains);

    for (var asset of commonAssets) {
        logger.info("Asset: ", asset.symbol);
    }

    logger.info("Assets common to chains: ", commonAssets.length);
}
main();
