import { StDotVaultSnapshot } from '@model/generated';
import { BigDecimal } from '@subsquid/big-decimal';
import { EntityManager } from 'typeorm';

export class StDotVaultRepository {

    constructor(private readonly em: EntityManager) { }

    /**
     * Carica l'ultimo snapshot disponibile (massimo blockNumber, afterTxId = null)
     */
    async loadLatestSnapshot(): Promise<StDotVaultSnapshot> {
        const row = await this.em.query(this._getLatestSnapshotQuery());

        if (row.length === 0) {
            //    uint16 internal constant DEFAULT_DEVELOPERS_FEE = 200;
            //    uint16 internal constant DEFAULT_TREASURY_FEE = 800;
            return new StDotVaultSnapshot({
                totalDot: BigInt(0),
                totalStDot: BigInt(0),
                fee: 800 + 200, // 10% fee
                feeTreasuryBP: 800,
                feeDevelopersBP: 200,
                paused: false,
                exchangeRate: BigDecimal(1),
            });
        }

        return this._mapSnapshot(row[0]);
    }

    /**
     * Costruisce manualmente lo snapshot da una riga raw SQL
     */
    private _mapSnapshot(row: any): StDotVaultSnapshot {
        return new StDotVaultSnapshot({
            id: row.id,
            blockNumber: row.block_number,
            // tx index data are null for the latest snapshot
            afterTxId: null,
            priorityInclusionFeePerUnit: null,
            index: null,

            paused: row.paused ?? false,

            totalDot: BigInt(row.total_dot),
            totalStDot: BigInt(row.total_st_dot),
            exchangeRate: BigDecimal(row.exchange_rate),

            fee: row.fee,
            feeTreasuryBP: row.fee_treasury_bp,
            feeDevelopersBP: row.fee_developers_bp,
        });
    }

    /**
     * Query SQL per trovare lo snapshot finale dell’ultimo blocco
     */
    private _getLatestSnapshotQuery(): string {
        return `
            SELECT * FROM st_dot_vault_snapshot
            WHERE after_tx_id IS NULL
              AND block_number = (
                  SELECT MAX(block_number)
                  FROM st_dot_vault_snapshot
              )
            LIMIT 1
        `;
    }
}
