import { ITrackedToken } from "@app/core/trackedPools/trackedPoolsTypes";

export class WhiteListTokensManager {
    protected tokensMap: Map<string, ITrackedToken>;

    constructor(tokens: ITrackedToken[]) {
        this.tokensMap = new Map(
            tokens.map(t => [t.id.toLowerCase(), t])
        );
    }

    /** Check if the token is in the whitelist */
    public has(token: ITrackedToken): boolean {
        return this.hasAddress(token.id);
    }

    /** Check if the address is in the whitelist */
    public hasAddress(address: string): boolean {
        return this.tokensMap.has(address.toLowerCase());
    }

    /** Returns the whitelist as an array of addresses */
    public list(): string[] {
        return Array.from(this.tokensMap.keys());
    }
}
