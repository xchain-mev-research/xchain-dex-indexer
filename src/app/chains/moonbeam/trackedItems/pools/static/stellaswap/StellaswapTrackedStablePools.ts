

// Data retrieved at block number 10_541_800

import { ITrackedStablePool } from "@app/core/trackedPools/trackedPoolsTypes";
import { onlyWithMoonbeamWhiteListedStableTokens } from "@app/chains/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager";

// Scritti a mano...
export const STELLASWAP_TRACKED_STABLE_POOLS: Array<ITrackedStablePool> = onlyWithMoonbeamWhiteListedStableTokens([
    {
        "id": "0xb1bc9f56103175193519ae1540a0a4572b1566f6",
        "totalValueLockedUSD": "1000",
        "createdAtBlockNumber": 2_119_228,
        "createdAtTimestamp": BigInt("1681641096000"),

        "tokens": [
            {
                "id": "0x322e86852e492a7ee17f28a78c663da38fb33bfb",
                "name": "Frax",
                "symbol": "FRAX",
                "decimals": "18"
            },
            {
                "id": "0x931715fee2d06333043d11f658c8ce934ac61d0c",
                "name": "USD Coin",
                "symbol": "USDC",
                "decimals": "6"
            },
            {
                "id": "0xffffffffea09fb06d082fd1275cd48b191cbcd1d",
                "name": "Tether USD",
                "symbol": "xcUSDT",
                "decimals": "6"

            },
            {
                "id": "0x692C57641fc054c2Ad6551Ccc6566EbA599de1BA",
                "name": "Binance USD",
                "symbol": "BUSD",
                "decimals": "6"

            }

        ]
    },

    {
        "id": "0x7fbe3126c03444d43fc403626ec81e3e809e6b46",
        "totalValueLockedUSD": "45000",
        "createdAtBlockNumber": 1_282_934,
        "createdAtTimestamp": BigInt("1681641096000"),// sbagliato...

        "tokens": [
            {
                "id": "0xdFA46478F9e5EA86d57387849598dbFB2e964b02",
                "name": "Mai",
                "symbol": "MAI",
                "decimals": "18"
            },
            {
                "id": "0xda782836b65edc4e6811c7702c5e21786203ba9d",
                "name": "Stella pool 4",
                "symbol": "StellaPool4",
                "decimals": "18"
            },

        ]
    },

    {
        "id": "0x5c3dc0ab1bd70c5cdc8d0865e023164d4d3fd8ec",
        "totalValueLockedUSD": "4500",
        "createdAtBlockNumber": 3_367_760,
        "createdAtTimestamp": BigInt("1681641096000"),

        "tokens": [
            {
                "id": "0x322e86852e492a7ee17f28a78c663da38fb33bfb",
                "name": "Frax",
                "symbol": "FRAX",
                "decimals": "18"
            },
            {
                "id": "0x931715fee2d06333043d11f658c8ce934ac61d0c",
                "name": "USD Coin",
                "symbol": "USDC",
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

    {
        "id": "0x95953409374e1ed252c6d100e7466e346e3dc5b9",
        "totalValueLockedUSD": "500",
        "createdAtBlockNumber": 3_367_838,
        "createdAtTimestamp": BigInt("1681642098000"),

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
            }
        ]
    },

    {
        "id": "0x422b5b7a15fb12c518aa29f9def640b4773427f8",
        "totalValueLockedUSD": "316000",
        "createdAtBlockNumber": 1_202_047,
        "createdAtTimestamp": BigInt("1654782852000"),

        "tokens": [
            {
                "id": "0x322e86852e492a7ee17f28a78c663da38fb33bfb",
                "name": "Frax",
                "symbol": "FRAX",
                "decimals": "18"
            },
            {
                "id": "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594",
                "name": "Tether USD",
                "symbol": "USDT",
                "decimals": "6"

            },
            {
                "id": "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
                "name": "USD Coin",
                "symbol": "USDC",
                "decimals": "6"

            },
            {
                "id": "0xc234a67a4f840e61ade794be47de455361b52413",
                "name": "Dai Stablecoin",
                "symbol": "DAI",
                "decimals": "18"

            }
        ]
    },



]);