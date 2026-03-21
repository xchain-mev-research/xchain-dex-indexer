import { logger } from "@app/core/log/logger";
import { IgnoreCaseMap, ITrackedToken } from "@app/core/trackedPools/trackedPoolsTypes";
import { Token } from "@model/generated";
import { OnceIndexer } from "../indexingEngine/onceIndexer/OnceIndexer";

export class TokensRepository {

    public static async loadTokensMap(ctx: any): Promise<IgnoreCaseMap<Token>> {
        var tokensMap: IgnoreCaseMap<Token> = new IgnoreCaseMap()

        try {
            const tokensDb = await ctx.store.findBy(Token, {});
            tokensDb.forEach((token: any) => tokensMap.set(token.id, token))
        }
        catch (e) {
            logger.error("Error loading tokens from database: ", e);
            throw e;
        }

        return tokensMap
    }

    public static storeTrackedTokens(trackedTokens: ITrackedToken[], schema: string = "whitelistedTokens") {

        OnceIndexer.startImport(schema, async ctx => {
            logger.info("**Starting import of tokens into schema " + schema);

            var tokens: Token[] = trackedTokens.map(TokensRepository._toDbToken);

            await ctx.store.insert(tokens)

            logger.info("**Finished import of tokens, count: " + tokens.length);

        });
    }

    public static _toDbToken(t: ITrackedToken) {
        if (typeof t.decimals === "string")
            t.decimals = Number(t.decimals);

        return new Token({
            id: t.id,
            symbol: t.symbol,
            name: t.name,
            decimals: t.decimals,
        });
    }

}

