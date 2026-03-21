
import { ITrackedStablePool } from "@app/core/trackedPools/trackedPoolsTypes";
import { onlyWithMoonbeamWhiteListedStableTokens } from "@app/chains/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager";


// https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-stableamm
// reserveUSD value at block_number 10_541_800


export const BEAMSWAP_TRACKED_STABLE_POOLS: Array<ITrackedStablePool> = onlyWithMoonbeamWhiteListedStableTokens([

    {
        "id": "0xe3f59ab3c37c33b6368cdf4f8ac79644011e402c",
        "totalValueLockedUSD": "6000",
        "createdAtBlockNumber": 3_636_866,
        "createdAtTimestamp": BigInt("1685013168000"),

        "tokens": [

            {
                "id": "0x931715fee2d06333043d11f658c8ce934ac61d0c",
                "name": "USD Coin",
                "symbol": "USDC",
                "decimals": "6"
            },
            {
                "id": "0xca01a1d0993565291051daff390892518acfad3a",
                "name": "Axelar Wrapped USDC",
                "symbol": "axlUSDC",
                "decimals": "6"
            },
            {
                "id": "0xffffffffea09fb06d082fd1275cd48b191cbcd1d",
                "name": "Tether USD",
                "symbol": "xcUSDT",
                "decimals": "6"
            }

        ]
    },

]);