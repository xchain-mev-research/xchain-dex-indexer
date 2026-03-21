

// --- Types ---

import { DexType } from "@model/generated";
import { graphqlRequest } from "../../graphql/graphqlRequest";
import { logger } from "../../log/logger";

export interface GraphqlSource {
    url: string;
    query: string;
    variables?: Record<string, any>;
}

export interface GraphqlComparisonConfig {
    name: string;
    dexType: DexType;
    minBlockNumber?: number;
    sourceA: GraphqlSource;
    sourceB: GraphqlSource;
    pools: { id: string }[];
    comparator: (itemA: any, itemB: any) => boolean;
}

// --- Main Class ---

export class GraphqlDbComparator {

    private sourceA: GraphqlSource;
    private sourceB: GraphqlSource;
    private idList: string[];
    private comparator: (itemA: any, itemB: any) => boolean;

    constructor(config: GraphqlComparisonConfig) {
        this.sourceA = config.sourceA;
        this.sourceB = config.sourceB;
        this.idList = config.pools.map(pool => pool.id);
        this.comparator = config.comparator;
    }

    public async compare(blockNumber: number): Promise<void> {
        if (!this.sourceA.variables)
            this.sourceA.variables = {};
        if (!this.sourceB.variables)
            this.sourceB.variables = {};

        // Set pools id to check
        this.sourceA.variables.idList = this.idList;
        this.sourceB.variables.idList = this.idList;
        // Set block number
        this.sourceA.variables.blockNumber = blockNumber;
        this.sourceB.variables.blockNumber = blockNumber;

        const [dataA, dataB] = await Promise.all([
            graphqlRequest(this.sourceA.url, this.sourceA.query, this.sourceA.variables),
            graphqlRequest(this.sourceB.url, this.sourceB.query, this.sourceB.variables)
        ]);

        if (!!dataA.errors) {
            logger.error(`❌ Error in Source A (${this.sourceA.url}):`, dataA.errors);
            return;
        }
        if (!!dataB.errors) {
            logger.error(`❌ Error in Source B (${this.sourceB.url}):`, dataB.errors);
            return;
        }

        const itemsA: any[] = this._extractItems(dataA.data);
        const itemsB: any[] = this._extractItems(dataB.data);

        if (itemsA.length !== itemsB.length) {
            logger.warn(`⚠️ Mismatch in number of items: SourceA=${itemsA.length}, SourceB=${itemsB.length}`);
        }

        const length = Math.min(itemsA.length, itemsB.length);

        for (let i = 0; i < length; i++) {
            const itemA = itemsA[i];
            const itemB = itemsB[i];

            if (!this.comparator(itemA, itemB))
                logger.error(`❌ Mismatch at block ${blockNumber}:`, { itemA, itemB });
        }
    }

    private _extractItems(data: any): any[] {
        // Extract data based on the GraphQL response structure
        const keys = Object.keys(data);
        if (keys.length !== 1) {
            throw new Error('Expected a single root field in GraphQL response. Found: ' + keys.join(','));
        }

        const root = data[keys[0]];

        if (Array.isArray(root)) {
            return root;
        } else {
            throw new Error('Expected an array at root field of GraphQL response');
        }
    }
}
