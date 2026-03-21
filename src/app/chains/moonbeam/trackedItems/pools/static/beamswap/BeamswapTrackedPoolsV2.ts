import { ITrackedV2Pool } from "@app/core/trackedPools/trackedPoolsTypes";
import { onlyWithMoonbeamWhiteListedTokens } from "@app/chains/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager";

/* query at https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v2/graphql
query{
   pairs(
    orderBy: reserveUSD
    orderDirection: desc
    where: {reserveUSD_gt: 1000}
    block: {number: 10541800}
  ) {
    id
    reserveUSD
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }
  }
}


*/


// reserveUSD value at block_number 10_541_800
export const BEAMSWAP_TRACKED_POOLS_V2: Array<ITrackedV2Pool> = onlyWithMoonbeamWhiteListedTokens([
    {
        "id": "0xa049a6260921b5ee3183cfb943133d36d7fdb668",
        "reserveUSD": "91834.49187780140761094799117390701",
        "token0": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        },
        "token1": {
            "id": "0xfffffffecb45afd30a637967995394cc88c0c194",
            "symbol": "POOP",
            "name": "Raresama POOP",
            "decimals": "18"
        }
    },
    {
        "id": "0x6ccb9c69b6a519cf38f72e111ab7bbcf457f9502",
        "reserveUSD": "27595.51926957467613774915356820756",
        "token0": {
            "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            "symbol": "xcDOT",
            "name": "xcDOT",
            "decimals": "10"
        },
        "token1": {
            "id": "0xffffffff30478fafbe935e466da114e14fb3563d",
            "symbol": "xcPINK",
            "name": "PINK",
            "decimals": "10"
        }
    },
    {
        "id": "0x99588867e817023162f4d4829995299054a5fc57",
        "reserveUSD": "24311.06756864145616925294477814786",
        "token0": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        },
        "token1": {
            "id": "0xcd3b51d98478d53f4515a306be565c6eebef1d58",
            "symbol": "GLINT",
            "name": "Beamswap Token",
            "decimals": "18"
        }
    },
    {
        "id": "0x79f05b32e29139c35cd219aedb5d99cedb1915ac",
        "reserveUSD": "7541.964633112943902880967020697878",
        "token0": {
            "id": "0x191cf2602ca2e534c5ccae7bcbf4c46a704bb949",
            "symbol": "wstDOT",
            "name": "Wrapped liquid staked DOT",
            "decimals": "10"
        },
        "token1": {
            "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            "symbol": "xcDOT",
            "name": "xcDOT",
            "decimals": "10"
        }
    },
    {
        "id": "0xeb39540415372cab38a2e124b2acc802ad9b2c72",
        "reserveUSD": "3232.760461465964489041641573426424",
        "token0": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        },
        "token1": {
            "id": "0xdf0120b4c74ab18c422bd6b0b4b71b22c2794093",
            "symbol": "DYOR",
            "name": "Memecoin Investor",
            "decimals": "18"
        }
    },
    {
        "id": "0xb929914b89584b4081c7966ac6287636f7efd053",
        "reserveUSD": "2564.052984429695442500786785432906",
        "token0": {
            "id": "0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b",
            "symbol": "USDC",
            "name": "USD Coin",
            "decimals": "6"
        },
        "token1": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        }
    },
    {
        "id": "0x9e7f014604574bfe5fefdfe5015563f2a2ba2b22",
        "reserveUSD": "2011.291329580312008776840457222881",
        "token0": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        },
        "token1": {
            "id": "0xffffffffea09fb06d082fd1275cd48b191cbcd1d",
            "symbol": "xcUSDT",
            "name": "Tether USD",
            "decimals": "6"
        }
    },
    {
        "id": "0x32b710dbf797c1b16498b0fcd83929bb19897529",
        "reserveUSD": "1569.660702309691426577945198222719",
        "token0": {
            "id": "0x65b09ef8c5a096c5fd3a80f1f7369e56eb932412",
            "symbol": "BEANS",
            "name": "MoonBeans",
            "decimals": "18"
        },
        "token1": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        }
    },
    {
        "id": "0x0f6325ef7e034f5c5b991442a23c796e5038e725",
        "reserveUSD": "1192.631192493592383605820059749449",
        "token0": {
            "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            "symbol": "xcDOT",
            "name": "xcDOT",
            "decimals": "10"
        },
        "token1": {
            "id": "0xffffffff7cc06abdf7201b350a1265c62c8601d2",
            "symbol": "xcBNC",
            "name": "BNC",
            "decimals": "12"
        }
    }
]);