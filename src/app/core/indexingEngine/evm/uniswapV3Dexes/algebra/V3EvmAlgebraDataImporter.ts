import { DexConfig } from '@app/core/config/DexConfig'
import { Log } from '@subsquid/evm-processor'

import { ParachainInfo } from '@app/core/parachainUtils/ParachainConst'
import { DexType, V3Pool, V3PoolSnapshot } from '@model/generated'
import { V3EvmDataImporter } from '../uniV3Forks/V3EvmDataImporter'
import { V3EvmAlgebraEventChecker } from './V3EvmAlgebraEventChecker'
import { V3EvmAlgebraEventsProcessor } from './V3EvmAlgebraEventsProcessor'
import { createV3EvmAlgebraProcessor } from './V3EvmAlgebraProcessor'
import { ConverterUtils } from '@app/core/utils/ConverterUtils'

export class V3EvmAlgebraDataImporter extends V3EvmDataImporter {

    constructor(dexType: DexType, parachain: ParachainInfo) {
        super(dexType, parachain,
            new V3EvmAlgebraEventsProcessor(DexConfig.getConfig(dexType, parachain)!.poolAbi),
            new V3EvmAlgebraEventChecker(DexConfig.getConfig(dexType, parachain)!.poolAbi)
        );
    }

    // Overrides 
    override async createProcessor(fromBlock: number, toBlock: number): Promise<any> {
        return createV3EvmAlgebraProcessor(this.dexConfig, fromBlock, toBlock);
    }

    override customLogProcess(log: Log) {
        const eventsChecker: V3EvmAlgebraEventChecker = this.eventsChecker as V3EvmAlgebraEventChecker;
        if (eventsChecker.isFeeChangedEvent(log))
            this._handleFeeChangedEvent(log);
    }

    override handleNewPoolEvent(log: Log): V3Pool | null {
        const { token0, token1, pool } =
            this.dexConfig.factoryAbi.events.Pool.decode(log);
        const id = pool.toLowerCase();

        if (!this.dexConfig.isPoolTracked(id) || this.isPoolTracked(id))
            return null;

        const t0 = this.tokensMap.get(token0.toLowerCase());
        const t1 = this.tokensMap.get(token1.toLowerCase());

        if (!t0 || !t1) return null;

        return new V3Pool({
            id,
            createdAtBlockNumber: log.block.height,
            createdAt: ConverterUtils.timestampToDate(log.block.timestamp),
            token0: t0,
            token1: t1,
            feeTier: BigInt(0), // Compatibility placeholder — actual fee is tracked per snapshot
            dex: this.dexConfig.dexType
        });
    }

    private _handleFeeChangedEvent(log: Log) {
        const event = this.dexConfig.poolAbi.events.Fee.decode(log);
        const snapshot: V3PoolSnapshot = this.getLatestPoolSnapshot(log);
        snapshot.fee = BigInt(event.fee);

        const updatedSnapshot = this.newPoolSnapshot(log, this.getPoolByLog(log), snapshot);
        this._afterEventHandler(log, updatedSnapshot);
    }

}
