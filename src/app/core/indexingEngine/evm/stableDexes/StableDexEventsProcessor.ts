import { DexType } from "@model/generated";
import { Log } from "@subsquid/evm-processor";

type StablePoolLatestPrice = any;

export class StableDexEventsProcessor {

    private ctx: any
    private dexType: DexType

    private constructor(dexType: DexType, ctx?: any) {
        this.ctx = ctx;
        this.dexType = dexType;
    }

    public static newInstance(dexType: DexType, ctx?: any): StableDexEventsProcessor {
        return new StableDexEventsProcessor(dexType, ctx);
    }

    public setContext(ctx: any) {
        this.ctx = ctx;
    }

    public async processAddLiquidityEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;

    }

    public async processRemoveLiquidityEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processRemoveLiquidityOneEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processRemoveLiquidityImbalanceEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processTokenSwapEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processRampAEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processStopRampAEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processNewSwapFeeEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processPausedEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

    public async processUnpausedEvent(param: StableDexEventsProcessorParam): Promise<void> {
        var currentPrice: StablePoolLatestPrice = param.latestPoolPrice;
    }

}


// -------- METHODS PARAM --------

export class StableDexEventsProcessorParam {

    log: Log;
    latestPoolPrice: StablePoolLatestPrice;

    constructor(log: Log, latestPoolPrice: StablePoolLatestPrice) {
        this.log = log;
        this.latestPoolPrice = latestPoolPrice;
    }

}

// END -------- METHODS PARAM --------


