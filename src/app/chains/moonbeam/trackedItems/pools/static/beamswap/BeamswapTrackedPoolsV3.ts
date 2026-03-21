import { ITrackedV3Pool } from "@app/core/trackedPools/trackedPoolsTypes";
import { onlyWithMoonbeamWhiteListedTokens } from "@app/chains/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager";

/* query at OLD  https://api.thegraph.com/subgraphs/name/beamswap/beamswap-v3/graphql
    new https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v3/
 block number 10_541_800
query  MyQuery {
  
   pools(
    orderBy: totalValueLockedUSD
    orderDirection: desc
    where: {totalValueLockedUSD_gt: 1000}
    block: {number: 10541800}
  ) {
    id
    totalValueLockedUSD
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
// totalValueLockedUSD value at block_number 10_541_800

export const BEAMSWAP_TRACKED_POOLS_V3: Array<ITrackedV3Pool> = onlyWithMoonbeamWhiteListedTokens([

    {
        "id": "0xf7e2f39624aad83ad235a090be89b5fa861c29b8",
        "totalValueLockedUSD": "105962.0266605872444943174172604675",
        "token0": {
            "id": "0x931715fee2d06333043d11f658c8ce934ac61d0c",
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
        "id": "0x3ecb97dae88c33717ce92596a593b41556a2ebc0",
        "totalValueLockedUSD": "23193.68701042793801175696225813419",
        "token0": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        },
        "token1": {
            "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            "symbol": "xcDOT",
            "name": "xcDOT",
            "decimals": "10"
        }
    },
    {
        "id": "0x946583b3801c703dfa042f82f3b9b3a2a9a79393",
        "totalValueLockedUSD": "9559.482436924798031377618238587476",
        "token0": {
            "id": "0xffffffff15e1b7e3df971dd813bc394deb899abf",
            "symbol": "xcvDOT",
            "name": "Bifrost Voucher DOT",
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
        "id": "0xca794bfccfd50253b19d03b608f2d0e1d2f9c0a3",
        "totalValueLockedUSD": "7907.041360963791623132291102660089",
        "token0": {
            "id": "0x931715fee2d06333043d11f658c8ce934ac61d0c",
            "symbol": "USDC",
            "name": "USD Coin",
            "decimals": "6"
        },
        "token1": {
            "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            "symbol": "xcDOT",
            "name": "xcDOT",
            "decimals": "10"
        }
    },
    {
        "id": "0xeba75d044a59b8d670a6ae09c255b6601e04ca9a",
        "totalValueLockedUSD": "3891.169496232075656657781913466445",
        "token0": {
            "id": "0xacc15dc74880c9944775448304b263d191c6077f",
            "symbol": "WGLMR",
            "name": "Wrapped GLMR",
            "decimals": "18"
        },
        "token1": {
            "id": "0xffffffff99dabe1a8de0ea22baa6fd48fde96f6c",
            "symbol": "xcvGLMR",
            "name": "Bifrost Voucher GLMR",
            "decimals": "18"
        }
    }
]);