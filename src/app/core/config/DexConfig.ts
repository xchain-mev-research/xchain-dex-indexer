import { ParachainInfo } from "@app/core/parachainUtils/ParachainConst";
import { DexType } from "src/model";
import { MoonbeamDexConfigRegistry } from "../../chains/moonbeam/config/MoonbeamDexConfigRegistry";
import { ISnapshotBootstrapConfig } from "../indexingEngine/bootstrap/SnapshotBootstrapConfig";

export interface IDexConfig {
    dexType: DexType;
    trackedPools: Map<string, null>;
    chain: ParachainInfo;

    // EVM DEXs
    factoryAddress?: string;
    factoryAddressCreatedAt?: number;
    factoryAbi?: any;
    poolAbi?: any;

    // Substrate DEXs
    palletName?: string;
    eventNames?: string[];

    // Indexing options
    intraBlockSnapshots?: boolean;  // default: false — If true, saves a snapshot for each transaction that modifies the pool.

    // Bootstrap: if set, the indexer fetches pool snapshots from the official subgraph
    // at (fromBlock - 1) before starting, so gap-filling works from the very first block.
    bootstrapConfig?: ISnapshotBootstrapConfig;
}

const dexConfigMap: Map<DexType, Map<string, DexConfig>> = new Map();
const factoriesMap: Map<string, Map<string, null>> = new Map();

export class DexConfig {

    private _config: IDexConfig

    constructor(config: IDexConfig) {
        this._config = config;
    }

    public getTrackedPoolsIds(): string[] {
        return Array.from(this._config.trackedPools.keys());
    }

    public isPoolTracked(poolId: string): boolean {
        return this._config.trackedPools.has(poolId.toLowerCase());
    }

    public static getConfig(dexType: DexType, parachain: ParachainInfo): DexConfig | null {
        return dexConfigMap.get(dexType)?.get(parachain.name) ?? null;
    }

    public static isFactoryTracked(address: string, parachain: ParachainInfo): boolean {
        return factoriesMap.get(parachain.name)?.has(address.toLowerCase()) ?? false;
    }

    public static getDexType(factoryAddress: string, parachain: ParachainInfo): DexType | null {
        const chainConfigs = dexConfigMap.values();
        for (const perChain of chainConfigs) {
            for (const config of perChain.values()) {
                if (
                    config._config.chain.id === parachain.id &&
                    _equalsIgnoreCase(config._config.factoryAddress!, factoryAddress)
                ) {
                    return config._config.dexType;
                }
            }
        }
        return null;
    }

    get schemaName() { return this._config.dexType.toString().toLowerCase(); }
    get dexType() { return this._config.dexType; }
    // Evm 
    get factoryAbi() { return this._config.factoryAbi; }
    get poolAbi() { return this._config.poolAbi; }
    get chain() { return this._config.chain; }
    get factoryAddress() { return this._config.factoryAddress; }
    get factoryAddressCreatedAt() { return this._config.factoryAddressCreatedAt; }

    // Substrate
    get palletName() { return this._config.palletName; }
    get eventNames() { return this._config.eventNames; }

    // Indexing options
    get intraBlockSnapshots() { return this._config.intraBlockSnapshots ?? false; }

    // Bootstrap
    get bootstrapConfig() { return this._config.bootstrapConfig ?? null; }

}

// Register all DEX configs
MoonbeamDexConfigRegistry.registerAllConfigs(dexConfigMap, factoriesMap);

// --------- PRIVATE UTILS ------

function _equalsIgnoreCase(str1: string, str2: string): boolean {
    return str1.toLowerCase() === str2.toLowerCase();
}

// END ----- PRIVATE UTILS ------

