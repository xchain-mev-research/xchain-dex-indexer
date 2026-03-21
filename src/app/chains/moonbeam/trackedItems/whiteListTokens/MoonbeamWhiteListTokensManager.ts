import { ITrackedPair, ITrackedStablePool, ITrackedToken } from "@app/core/trackedPools/trackedPoolsTypes";
import { MOONBEAM_WHITE_LIST_TOKENS } from "./whiteListTokensConst";
import { WhiteListTokensManager } from "@app/core/whitelistTokens/WhiteListTokensManager";

export class MoonbeamWhiteListTokensManager extends WhiteListTokensManager {

  private static _instance: MoonbeamWhiteListTokensManager;

  private constructor() {
    super(MOONBEAM_WHITE_LIST_TOKENS);
  }

  /** Singleton access */
  public static instance(): MoonbeamWhiteListTokensManager {
    if (!this._instance) {
      this._instance = new MoonbeamWhiteListTokensManager();
    }
    return this._instance;
  }

}

export function onlyWithMoonbeamWhiteListedTokens<T extends ITrackedPair>(pools: T[]): T[] {
  return pools.filter(pool => {
    const result = (
      MoonbeamWhiteListTokensManager.instance().has(pool.token0)
      &&
      MoonbeamWhiteListTokensManager.instance().has(pool.token1)
    );
    if (!result) {
      //  logger.info("pool not whitelisted", pool);
    }

    return result;

  });
}

export function onlyWithMoonbeamWhiteListedStableTokens<T extends ITrackedStablePool>(pools: T[]): T[] {
  return pools.filter(pool => {
    var tokens = pool.tokens;
    var allTokensWhiteListed = true;

    for (var token of tokens) {
      if (!MoonbeamWhiteListTokensManager.instance().has(token)) {
        allTokensWhiteListed = false;
        break;
      }
    }

    if (!allTokensWhiteListed) {
      //     logger.info("Stable pool not whitelisted", pool);
    }
    return allTokensWhiteListed;
  });
}