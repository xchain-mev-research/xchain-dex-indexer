



/* TODO: Completly review and complete
export type PriceDataEntity = any;
export type CoinBalanceEntity = StablePoolCoinBalance;

type PoolEntity = StablePool;
type LatestPrice = IStablePoolPriceData
export class StableDexDataImporter extends AbstractDexPriceDataImporter
    <PoolEntity, LatestPrice, PriceDataEntity> {

    private eventsProcessor: StableDexEventsProcessor;

    // ---------- Context scope variables ----------

    private endBlockCoinsBalanceSnapshots: CoinBalanceEntity[];

    // END ------- Context scope variables ----------


    constructor(dexType: DexType, debug: boolean) {
        super(dexType, debug)

        this.eventsProcessor = StableDexEventsProcessor.newInstance(this.dexType);
    }

    // ---------- OVERRIDES ----------

    protected async createProcessor(fromBlock: number, toBlock: number): Promise<any> {
        return createStableDexProcessor(fromBlock, toBlock, this.dexType);
    }

    protected async onProcessStart(): Promise<void> {
        super.onProcessStart();

        // Clear context scope variables
        this.endBlockCoinsBalanceSnapshots = []
    }

    protected async processBlock(block: Block): Promise<void> {
        this.eventsProcessor.setContext(this.getCtx());

        for (let log of block.logs) {
            this.setCurrentProcessingLog(log);

            if (this.isPoolTracked(log.address)) {

                if (StableDexEventsChecker.isAddLiquidityEvent(log))
                    await this.handleAddLiquidityEvent();

                else if (StableDexEventsChecker.isRemoveLiquidityEvent(log))
                    await this.handleRemoveLiquidityEvent();

                else if (StableDexEventsChecker.isRemoveLiquidityOneEvent(log))
                    await this.handleRemoveLiquidityOneEvent();

                else if (StableDexEventsChecker.isRemoveLiquidityImbalanceEvent(log))
                    await this.handleRemoveLiquidityImbalanceEvent();

                else if (StableDexEventsChecker.isTokenSwapEvent(log))
                    await this.handleTokenSwapEvent();

                else if (StableDexEventsChecker.isRampAEvent(log))
                    await this.handleRampAEvent();

                else if (StableDexEventsChecker.isStopRampAEvent(log))
                    await this.handleStopRampAEvent();

                else if (StableDexEventsChecker.isNewSwapFeeEvent(log))
                    await this.handleNewSwapFeeEvent();

                else if (StableDexEventsChecker.isPausedEvent(log))
                    await this.handlePausedEvent();

                else if (StableDexEventsChecker.isUnpausedEvent(log))
                    await this.handleUnpausedEvent();

            }
        }

    }

    protected async doInserts() {
        await super.doInserts()

        // store coins balances

        let store = this.getCtx().store;

        await store.insert(this.endBlockCoinsBalanceSnapshots)

        // Insert all Coin Balances of all blocks internal prices
        var coinsBalanceToInsert: IStablePoolCoinBalance[] = [];

        var blocksInternalPricies: StablePoolPriceData[] = this.getAllBlocksInternalPrices();
        for (let price of blocksInternalPricies)
            coinsBalanceToInsert.push(...price.coins)

        await store.insert(coinsBalanceToInsert)
    }

    protected createPriceSnapshot(latestPoolPrice: LatestPrice, poolId: string, blockNumber: number): PriceDataEntity {
        var priceSnapshot: PriceDataEntity = createPriceDataEntity({
            id: poolId + "-" + blockNumber + "-end",
            afterTxId: null,
            blockNumber: blockNumber,

            index: null,
            pool: this.factoryPoolsMap.get(poolId),

            fee: latestPoolPrice.fee,
            a: latestPoolPrice.a,
            initialA: latestPoolPrice.initialA,
            initialATime: latestPoolPrice.initialATime,
            futureA: latestPoolPrice.futureA,
            futureATime: latestPoolPrice.futureATime,

            paused: latestPoolPrice.paused as boolean,
            virtualPrice: latestPoolPrice.virtualPrice,

            coins: copyCoinsEntities(latestPoolPrice.coins),
        }, this.dexType);

        priceSnapshot.coins?.forEach(coinBalance => {
            coinBalance.id = newCoinId(priceSnapshot.id, coinBalance.coin.index)
            coinBalance.poolPriceData = priceSnapshot;
        });

        this.endBlockCoinsBalanceSnapshots.push(...priceSnapshot.coins);

        return priceSnapshot
    }

    protected createLatestPoolPrice(priceData: PriceDataEntity): LatestPrice {
        var latestPoolPrice: StablePoolLatestPrice = new StablePoolLatestPrice();

        latestPoolPrice.id = priceData.id;
        latestPoolPrice.pool = priceData.pool;
        latestPoolPrice.blockNumber = priceData.blockNumber;
        latestPoolPrice.afterTxId = priceData.afterTxId;
        latestPoolPrice.index = priceData.index;

        latestPoolPrice.a = priceData.a;
        latestPoolPrice.initialA = priceData.initialA;
        latestPoolPrice.futureA = priceData.futureA;
        latestPoolPrice.initialATime = priceData.initialATime;
        latestPoolPrice.futureATime = priceData.futureATime;

        latestPoolPrice.fee = priceData.fee;
        latestPoolPrice.virtualPrice = priceData.virtualPrice;

        latestPoolPrice.paused = priceData.paused;
        latestPoolPrice.coins = copyCoinsEntities(priceData.coins);

        return latestPoolPrice
    }

    protected async loadPools(): Promise<Map<string, PoolEntity>> {
        return await this.dataLoader.loadStablePoolsIds(this.getCtx())
    }

    protected async loadLatestPrices(): Promise<Map<string, LatestPrice>> {
        return await this.dataLoader.loadLatestPricesStablePools(this.getCtx())
    }

    // END ---------- OVERRIDES ----------


    // ------- EVENTs HANDLEs -------

    private async handleAddLiquidityEvent(): Promise<void> {
        super.printlnWithBlockInfo("Add liquidity Event ");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processAddLiquidityEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleRemoveLiquidityEvent(): Promise<void> {
        super.printlnWithBlockInfo("Remove Liquidity Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processRemoveLiquidityEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleRemoveLiquidityOneEvent(): Promise<void> {
        super.printlnWithBlockInfo("Remove Liquidity One Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processRemoveLiquidityOneEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleRemoveLiquidityImbalanceEvent(): Promise<void> {
        super.printlnWithBlockInfo("Remove Liquidity Imbalance Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processRemoveLiquidityImbalanceEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleTokenSwapEvent(): Promise<void> {
        super.printlnWithBlockInfo("Token Swap Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processTokenSwapEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleRampAEvent(): Promise<void> {
        super.printlnWithBlockInfo("Ramp A Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processRampAEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleStopRampAEvent(): Promise<void> {
        super.printlnWithBlockInfo("Stop Ramp A Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processStopRampAEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleNewSwapFeeEvent(): Promise<void> {
        super.printlnWithBlockInfo("New Swap Fee Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processNewSwapFeeEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handlePausedEvent(): Promise<void> {
        super.printlnWithBlockInfo("Paused Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processPausedEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private async handleUnpausedEvent(): Promise<void> {
        super.printlnWithBlockInfo("Unpaused Event");

        var processParam: StableDexEventsProcessorParam = this._createEventsProcessorParam();
        await this.eventsProcessor.processUnpausedEvent(processParam);

        this.afterEventHandler(processParam.latestPoolPrice)
    }

    private afterEventHandler(newLatestPoolPrice: LatestPrice) {
        // FIXME: non dovrebbe essere necessario, testare
        // priceDataEntity.coins = this._toCoinsBalanceEntities(priceDataEntity, priceDataEntity.coins)

        // this.trackCoinsInMemory(priceDataEntity.coins)

        var priceDataEntity: PriceDataEntity = this.latestPriceToEntity(newLatestPoolPrice);

        super.handleNewPrice(this.getCurrentProcessingLog(), priceDataEntity)
    }


    // END ------- EVENTs HANDLEs -------


    // ------- UTILS -------



    private _toCoinsBalanceEntities(priceData: PriceDataEntity, coinsBalance: CoinBalanceEntity[]): CoinBalanceEntity[] {
        return coinsBalance?.map(coinBalance =>
            createCoinBalanceEntity(coinBalance, this.dexType, priceData)
        );
    }

    private _createEventsProcessorParam(): StableDexEventsProcessorParam {
        var log: Log = this.getCurrentProcessingLog();
        return new StableDexEventsProcessorParam(log, this.getLatestPrice(log.address))
    }

    private latestPriceToEntity(latestPoolPrice: LatestPrice): PriceDataEntity {
        var log: Log = this.getCurrentProcessingLog();

        let extractedProperties: Partial<PriceDataEntity> = extractPricePropertiesAfterTx(log, this.getPool(log), latestPoolPrice);
        var priceDataEntity: PriceDataEntity = createPriceDataEntity(extractedProperties, this.dexType);

        return priceDataEntity;
    }

    // END ------- UTILS -------

}

function updateCoinsBalanceIds(priceDataEntityId: string, coins: IStablePoolCoinBalance[]) {
    if (!coins) return

    coins.forEach(coinBalance => {
        coinBalance.id = newCoinId(priceDataEntityId, coinBalance.coin.index)
    })
}

function extractPricePropertiesAfterTx(log: any, pool: PoolEntity, latestPoolPrice: LatestPrice): Partial<PriceDataEntity> {
    let tx = log.getTransaction();
    let blockNumber = log.block.height
    let afterTxIndex = log.transactionIndex
    var priceEntityId = pool.id + "-" + blockNumber + "-" + afterTxIndex;

    // setto gli id di tutti i CoinBalance di questo prezzo, siccome il latestPrice potrebbe avere CoinBalance 
    // che non sono aggiornati da questo evento, ma sono rimasti invariati
    var coins = copyCoinsEntities(latestPoolPrice.coins)
    updateCoinsBalanceIds(priceEntityId, coins)

    return {
        id: priceEntityId,
        blockNumber: blockNumber,

        pool: pool,

        afterTxId: tx.hash,
        index: afterTxIndex,

        fee: latestPoolPrice.fee,
        virtualPrice: latestPoolPrice.virtualPrice,

        a: latestPoolPrice.a,
        initialA: latestPoolPrice.initialA,
        initialATime: latestPoolPrice.initialATime,
        futureA: latestPoolPrice.futureA,
        futureATime: latestPoolPrice.futureATime,

        paused: latestPoolPrice.paused,

        coins: coins
    }
}


// ------- UTILS -------


function createPriceDataEntity(properties: Partial<PriceDataEntity>, dexType: DexType): PriceDataEntity {
    return new StablePoolPriceData(properties);
}

function createCoinBalanceEntity(properties: Partial<CoinBalanceEntity>, dexType: DexType, priceData?: PriceDataEntity): CoinBalanceEntity {

    let p: Partial<StablePoolCoinBalance> = properties;
    if (priceData)
        p.poolPriceData = priceData as StablePoolPriceData;

    return new StablePoolCoinBalance(p);
}

function copyCoinsEntities(array: CoinBalanceEntity[]): CoinBalanceEntity[] {
    return array?.map(properties => {
        let p: Partial<StablePoolCoinBalance> = properties as unknown as Partial<StablePoolCoinBalance>;
        return new StablePoolCoinBalance(p);
    }) ?? [];
}


function newCoinId(priceId: string, coinIndex: number): string {
    return priceId + "#" + coinIndex;
}

// END ------- UTILS -------
*/