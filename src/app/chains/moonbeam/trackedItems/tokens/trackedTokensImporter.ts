import { graphqlRequest } from "@app/core/graphql/graphqlRequest";
import { logger } from "@app/core/log/logger";
import { ITrackedToken } from "@app/core/trackedPools/trackedPoolsTypes";
import { BigDecimal } from "@subsquid/big-decimal";
import * as fs from 'fs';

// FIXME: renderlo usabile su piu chain
const TOKENS_QUERY_V2 = `
 query tokensQuery($first: Int! = 1000) {
  tokens(first: $first, orderBy: tradeVolumeUSD, orderDirection: desc) {
    id
    symbol
    name
    decimals
    tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
      totalLiquidityUSD
    }
  }
}

`;
const TOKENS_QUERY_V3_4 = `
query tokensQuery($first: Int! = 1000) {
  tokens(first: $first, orderBy: volumeUSD, orderDirection: desc) {
    id
    symbol
    name
    decimals
    tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
      totalValueLockedUSD
    }
  }
}

`;
const DEX_LIST = [
    {
        name: "Stellaswap",
        outputFileName: "trackedStellaswapTokens",
        outputConstName: "TRACKED_STELLASWAP_TOKENS",
        sources: [
            {
                name: "StellaSwap V2",
                url: "https://analytics.stellaswap.com/api/graphql/v2",
                query: TOKENS_QUERY_V2,
            },
            {
                name: "StellaSwap V3",
                url: "https://analytics.stellaswap.com/api/graphql/v3",
                query: TOKENS_QUERY_V3_4,
            },
            {
                name: "StellaSwap V4",
                url: "https://analytics.stellaswap.com/api/graphql/v4",
                query: TOKENS_QUERY_V3_4,
            }
        ],

    },
    {
        name: "Beamswap",
        outputFileName: "trackedBeamswapTokens",
        outputConstName: "TRACKED_BEAMSWAP_TOKENS",
        sources: [
            {
                name: "Beamswap V2",
                url: "https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v2",
                query: TOKENS_QUERY_V2,
            }, {
                name: "Beamswap V3",
                url: "https://graph.beamswap.io/subgraphs/name/beamswap/beamswap-amm-v3-temp",
                query: TOKENS_QUERY_V3_4,
            }
        ],

    }

];

export interface ITokenWithTVLUSD extends ITrackedToken {
    tvlUSD: BigDecimal;
}

// npm run start -- src/moonbeam/trackedPools/trackedTokens/trackedTokensImporter.ts
async function main() {
    var allTokens: Map<string, ITrackedToken> = new Map();

    for (const dex of DEX_LIST) {
        const allDexTokens: Map<string, ITokenWithTVLUSD> = await processDex(dex);

        allDexTokens.forEach((token: ITokenWithTVLUSD) => {
            const key = token.id.toLowerCase();
            if (!allTokens.has(key)) {
                delete token.tvlUSD;
                allTokens.set(key, token);
            }
        });
    }

    saveTokensToFile(
        Array.from(allTokens.values()),
        "allMoonbeamTokens",
        "ALL_MOONBEAM_TOKENS",
        false,
    );

    logger.info("Token unificati - DONE");
    return;
}

async function processDex(dex: any): Promise<Map<string, ITokenWithTVLUSD>> {
    const tokensMap: Map<string, ITokenWithTVLUSD> = new Map();
    logger.info(`📡  Processing dex ${dex.name} …`);

    for (var i = 0; i < dex.sources.length; i++) {
        const src = dex.sources[i];
        logger.info(`📡  Fetching tokens from ${src.name} …`);

        const data = await graphqlRequest(src.url, src.query);
        logger.info(`📡  Tokens from ${src.name} fetched.`)

        var tokens: ITokenWithTVLUSD[] = filterByLiquidity(data.data.tokens).map((t: any) => {
            const token: any = {
                id: t.id,
                symbol: t.symbol,
                name: t.name,
                decimals: t.decimals,
                tvlUSD: BigDecimal(
                    t.tokenDayData[0].totalValueLockedUSD || t.tokenDayData[0].totalLiquidityUSD
                ),
            };
            return token;
        });

        for (const token of tokens) {
            const key = token.id.toLowerCase();
            if (tokensMap.has(key))
                // Se c'è aumentiamo il tvl, per sommare la liquidita dei token presenti in pool v2,3,4
                tokensMap.get(key)!.tvlUSD = tokensMap.get(key)!.tvlUSD.add(token.tvlUSD);
            else
                tokensMap.set(key, token);
        }

        logger.info(`✅  ${tokens.length} tokens processed.`);
    }

    return tokensMap;
}

function saveTokensToFile(
    tokens: ITokenWithTVLUSD[] | ITrackedToken[],
    fileName: string,
    constName: string,
    storeTvl: boolean = true,
) {

    var baseOutputDir =
        "/home/alessio/workspace/defi-data-importer/src/moonbeam/trackedPools/trackedTokens/appGenerated/";

    // sort by tvl
    var finalTokenList: any[] = tokens.sort((a: any, b: any) => {
        if (!a.tvlUSD)
            return 0;
        return b.tvlUSD.cmp(a.tvlUSD);
    });

    fs.mkdirSync(baseOutputDir, { recursive: true });
    var typeImport = storeTvl ?
        `import { ITokenWithTVLUSD } from "../trackedTokensImporter";`
        :
        `import { IToken } from "@app/core/poolsInfoImporter/trackedPoolsTypes";`
        ;
    var resultContent = `
${storeTvl ? `import { BigDecimal } from "@subsquid/big-decimal";` : ``}
${typeImport}

export const ${constName}:  ${storeTvl ? `ITokenWithTVLUSD` : `IToken`}[] = [
${finalTokenList.map(t => `  {
    id: "${t.id}",
    symbol: "${t.symbol}",
    name: "${t.name}",
    decimals: "${t.decimals}",
    ${storeTvl ? `tvlUSD: BigDecimal("${t.tvlUSD.toString()}")` : ``}
  }`).join(",\n")}
];
`;
    fs.writeFileSync(baseOutputDir + fileName + ".ts", resultContent);
}

function filterByLiquidity(tokens: any): any {
    return tokens.filter((token: any) => {
        const dayData = token.tokenDayData[0];
        if (!dayData) return false;

        var liquidityVal = dayData.totalValueLockedUSD || dayData.totalLiquidityUSD;
        const liquidity = BigDecimal(liquidityVal);

        return liquidity.gte(BigDecimal(1000));
    });
}

main()
    .then(() => {
        logger.info("Token unificati - DONE");
    });
