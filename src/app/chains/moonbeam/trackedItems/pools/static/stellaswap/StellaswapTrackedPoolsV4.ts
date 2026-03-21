import { ITrackedV4Pool } from '@app/core/trackedPools/trackedPoolsTypes';
import { onlyWithMoonbeamWhiteListedTokens } from '@app/chains/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager';

/* - check plugin -

const ethProvider = new ethers.JsonRpcProvider('https://rpc.api.moonbeam.network')
const abi = new Interface([
    'function plugin() view returns (address)'
])
async function getPluginAddress(
    poolAddress: string,
): Promise<string | null> {
    try {

        const data = abi.encodeFunctionData('plugin', [])
        const result = await ethProvider.call({ to: poolAddress, data })
        const [pluginAddress] = abi.decodeFunctionResult('plugin', result)
        return pluginAddress.toLowerCase() === '0x0000000000000000000000000000000000000000' ? null : pluginAddress

    } catch (error) {
        console.error(`Errore durante la chiamata plugin() sul pool ${poolAddress}:`, error);
        return null;
    }
}

async function test() {

    var pluginAddressSet = new Set<string>();
    for (let i = 0; i < STELLASWAP_TRACKED_POOLS_V4.length; i++) {
        const pool = STELLASWAP_TRACKED_POOLS_V4[i];
        const pluginAddress = await getPluginAddress(pool.id);
        if (pluginAddress) {
            pluginAddressSet.add(pluginAddress);
        }
    }

    pluginAddressSet.forEach((address) => {
        console.log("Plugin address:", address);
    });
}
    */
// Data retrieved at block number 11_431_239
// Presi dal subgraph https://thegraph.com/explorer/subgraphs/LgiKJnsTspbsPBLqDPqULPtnAdSZP6LfPCSo3GWuJ5a?view=Query&chain=arbitrum-one
export const STELLASWAP_TRACKED_POOLS_V4: Array<ITrackedV4Pool> = onlyWithMoonbeamWhiteListedTokens([
  {
    "id": "0x71785b1a85b158ef7b59ef4c0feb72430cc3de12",
    "token0": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffffea09fb06d082fd1275cd48b191cbcd1d",
      "name": "Tether USD",
      "symbol": "xcUSDT"
    },
    "totalValueLockedUSD": "925288.090814905"
  },
  {
    "id": "0xc295aa4287127c5776ad7031648692659ef2cebb",
    "token0": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "token1": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "totalValueLockedUSD": "562122.1428889238645843405011906082"
  },
  {
    "id": "0x28137d36ad945b0c1b35f2bf90cfe6ff6cb87511",
    "token0": {
      "decimals": "6",
      "id": "0xca01a1d0993565291051daff390892518acfad3a",
      "name": "Axelar Wrapped USDC",
      "symbol": "axlUSDC"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "totalValueLockedUSD": "529774.3800842121438128431441055675"
  },
  {
    "id": "0xac25c73589b3c67e83c72279e122e71f49a329d6",
    "token0": {
      "decimals": "10",
      "id": "0xbc7e02c4178a7df7d3e564323a5c359dc96c4db4",
      "name": "Stella stDOT",
      "symbol": "stDOT"
    },
    "token1": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "totalValueLockedUSD": "406305.7476567603046155110379328471"
  },
  {
    "id": "0x2439711fcb62b09a375eade27b12ac24ebd47532",
    "token0": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "token1": {
      "decimals": "10",
      "id": "0xffffffffa9cfffa9834235fe53f4733f1b8b28d4",
      "name": "Acala Liquid DOT",
      "symbol": "xcLDOT"
    },
    "totalValueLockedUSD": "382359.0695052557976855662600812208"
  },
  {
    "id": "0x921b35e54b45b60ee8142fa234baeb2ff5e307e0",
    "token0": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffffea09fb06d082fd1275cd48b191cbcd1d",
      "name": "Tether USD",
      "symbol": "xcUSDT"
    },
    "totalValueLockedUSD": "316498.7666125266947433496384479102"
  },
  {
    "id": "0x69d01c4500906e4912fd810b98ad264f9c7f6921",
    "token0": {
      "decimals": "10",
      "id": "0xffffffff15e1b7e3df971dd813bc394deb899abf",
      "name": "Bifrost Voucher DOT",
      "symbol": "xcvDOT"
    },
    "token1": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "totalValueLockedUSD": "191011.0551374223330113762913664302"
  },
  {
    "id": "0x8b86404faa0269fc18c6abb091e551454b29bc30",
    "token0": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "totalValueLockedUSD": "150680.3566711100800933499139080341"
  },
  {
    "id": "0x2232e98829f985c95c6930342b607496cad7a560",
    "token0": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "token1": {
      "decimals": "18",
      "id": "0xffffffffaff6df83d0a1935dda2e5f1f402c0c45",
      "name": "Snowbridge ETH",
      "symbol": "ETH.e"
    },
    "totalValueLockedUSD": "75556.59561935838392520426860240493"
  },
  {
    "id": "0x820a417f5e2b4383987300c23f75cdadf01304aa",
    "token0": {
      "decimals": "8",
      "id": "0xffffffff1b4bb1ac5749f73d866ffc91a3432c47",
      "name": "Snowbridge WBTC",
      "symbol": "WBTC.e"
    },
    "token1": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "totalValueLockedUSD": "65045.09882844456001203883843341343"
  },
  {
    "id": "0x6328a25a88b5efba61ed51bf0e6e153169c52a02",
    "token0": {
      "decimals": "18",
      "id": "0xfeb25f3fddad13f82c4d6dbc1481516f62236429",
      "name": "BRLA Token",
      "symbol": "BRLA"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "totalValueLockedUSD": "38856.41745322157686617083946770829"
  },
  {
    "id": "0x2b4058ff96e3f957df2616a650aeb9ba9179006a",
    "token0": {
      "decimals": "18",
      "id": "0x434116a99619f2b465a137199c38c1aab0353913",
      "name": "Diode",
      "symbol": "DIODE"
    },
    "token1": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "totalValueLockedUSD": "35723.63810956835444794873968760315"
  },
  {
    "id": "0xca8fc2f9d873e8d67aa60f36934a3dc7b4cea30b",
    "token0": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "token1": {
      "decimals": "12",
      "id": "0xffffffffb3229c8e7657eabea704d5e75246e544",
      "name": "NeuroWeb",
      "symbol": "xcNEURO"
    },
    "totalValueLockedUSD": "29665.95349235124342989262479536516"
  },
  {
    "id": "0x2800213f2da5872b7fd7143f7b8bec6f3da7bb39",
    "token0": {
      "decimals": "8",
      "id": "0xe57ebd2d67b462e9926e04a8e33f01cd0d64346d",
      "name": "Wrapped BTC",
      "symbol": "WBTC"
    },
    "token1": {
      "decimals": "8",
      "id": "0xffffffff5ac1f9a51a93f5c527385edf7fe98a52",
      "name": "interBTC",
      "symbol": "xcIBTC"
    },
    "totalValueLockedUSD": "24418.4937260526969930542766132775"
  },
  {
    "id": "0x2cc4c3a48432f5bc5ad8c449ff0910e0531b7f1f",
    "token0": {
      "decimals": "18",
      "id": "0x0e358838ce72d5e61e0018a2ffac4bec5f4c88d2",
      "name": "StellaSwap",
      "symbol": "STELLA"
    },
    "token1": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "totalValueLockedUSD": "21071.82885215142766566323529046224"
  },
  {
    "id": "0x07f2ec33ffc1190271f83c9c93636a63c513cbb4",
    "token0": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "token1": {
      "decimals": "18",
      "id": "0xffffffff7d3875460d4509eb8d0362c611b4e841",
      "name": "Manta",
      "symbol": "xcMANTA"
    },
    "totalValueLockedUSD": "13779.36959539532002681876435225304"
  },
  {
    "id": "0x12deaae27b2838508c24088c1d5ae9de9d250007",
    "token0": {
      "decimals": "18",
      "id": "0x6021d2c27b6fbd6e7608d1f39b41398caee2f824",
      "name": "Cypress",
      "symbol": "CP"
    },
    "token1": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "totalValueLockedUSD": "12890.50812182609495873793523916457"
  },
  {
    "id": "0x44252055e621b1facc2ab373c3527c96d8871582",
    "token0": {
      "decimals": "6",
      "id": "0x931715fee2d06333043d11f658c8ce934ac61d0c",
      "name": "USD Coin",
      "symbol": "USDC"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "totalValueLockedUSD": "8648.397152800044385556400009483943"
  },
  {
    "id": "0xd8f6ca7957ec7fdbbf0a9f5b6f4419973b051d21",
    "token0": {
      "decimals": "18",
      "id": "0x6021d2c27b6fbd6e7608d1f39b41398caee2f824",
      "name": "Cypress",
      "symbol": "CP"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "totalValueLockedUSD": "4452.684861434092955265199046516626"
  },
  {
    "id": "0x01ae92b87af1b21720871d445e1e5a7f991332eb",
    "token0": {
      "decimals": "18",
      "id": "0xab3f0245b83feb11d15aaffefd7ad465a59817ed",
      "name": "Wrapped Ether",
      "symbol": "WETH"
    },
    "token1": {
      "decimals": "18",
      "id": "0xffffffffaff6df83d0a1935dda2e5f1f402c0c45",
      "name": "Snowbridge ETH",
      "symbol": "ETH.e"
    },
    "totalValueLockedUSD": "3727.784846349111419614305952722705"
  },
  {
    "id": "0x18df53b680ee9e873ea8964f110f24a94f6587ff",
    "token0": {
      "decimals": "18",
      "id": "0xacc15dc74880c9944775448304b263d191c6077f",
      "name": "Wrapped GLMR",
      "symbol": "WGLMR"
    },
    "token1": {
      "decimals": "18",
      "id": "0xffffffffdd704e8e824a5eec47de88f5b9e13588",
      "name": "LAOS",
      "symbol": "xcLAOS"
    },
    "totalValueLockedUSD": "3657.042399087342341258197669445588"
  },
  {
    "id": "0x19587616715006a5da5380ce758a85e8b39ddd06",
    "token0": {
      "decimals": "18",
      "id": "0x6021d2c27b6fbd6e7608d1f39b41398caee2f824",
      "name": "Cypress",
      "symbol": "CP"
    },
    "token1": {
      "decimals": "10",
      "id": "0xffffffff43b4560bc0c451a3386e082bff50ac90",
      "name": "Subsocial",
      "symbol": "xcSUB"
    },
    "totalValueLockedUSD": "2667.270664178412258408024784646943"
  },
  {
    "id": "0xaac5b58833a1e4264b0c1da8c0154779c714583b",
    "token0": {
      "decimals": "18",
      "id": "0x0e358838ce72d5e61e0018a2ffac4bec5f4c88d2",
      "name": "StellaSwap",
      "symbol": "STELLA"
    },
    "token1": {
      "decimals": "6",
      "id": "0xffffffff7d2b0b761af01ca8e25242976ac0ad7d",
      "name": "USD Coin",
      "symbol": "xcUSDC"
    },
    "totalValueLockedUSD": "1701.946186127923914484846935388236"
  },
  {
    "id": "0xeb6359ed2cf18212db0212dd493c8bf0fd586fbd",
    "token0": {
      "decimals": "10",
      "id": "0xffffffff1fcacbd218edc0eba20fc2308c778080",
      "name": "xcDOT",
      "symbol": "xcDOT"
    },
    "token1": {
      "decimals": "18",
      "id": "0xffffffff44bd9d2ffee20b25d1cf9e78edb6eae3",
      "name": "Centrifuge",
      "symbol": "xcCFG"
    },
    "totalValueLockedUSD": "1047.189288458474320513900611677327"
  }
])