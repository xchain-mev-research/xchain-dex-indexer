import { V2EvmDexDataImporter } from '@app/core/indexingEngine/evm/uniswapV2Dexes/V2EvmDexDataImporter';
import { V3EvmAlgebraDataImporter } from '@app/core/indexingEngine/evm/uniswapV3Dexes/algebra/V3EvmAlgebraDataImporter';
import { V3EvmDataImporter } from '@app/core/indexingEngine/evm/uniswapV3Dexes/uniV3Forks/V3EvmDataImporter';
import { V4EvmAlgebraDataImporter } from '@app/core/indexingEngine/evm/uniswapV4Dexes/algebra/V4EvmAlgebraDataImporter';
import { logger } from '@app/core/log/logger';
import { Parachain } from '@app/core/parachainUtils/ParachainConst';
import { DexType } from '@model/generated';
import { StDotIndexer } from './indexer/stDot/StDotIndexer';

/**
 * Moonbeam indexer entry point.
 *
 * DEX supportati:
 *   - StellaSwap V2  (Uniswap V2 fork)
 *   - StellaSwap V3  (Algebra fork, snapshot intra-blocco abilitati)
 *   - StellaSwap V4  (Algebra V4 fork)
 *   - Beamswap  V2  (Uniswap V2 fork)
 *   - Beamswap  V3  (Uniswap V3 fork)
 *   - stDOT Nimbus vault
 *
 * La configurazione viene caricata dalle variabili d'ambiente (vedi .env.example).
 * Per abilitare/disabilitare singoli importer, commentare/decommentare le chiamate nel main().
 *
 * Range di blocchi:
 *   FROM_BLOCK  — primo blocco da indicizzare (default: blocco di deploy della factory)
 *   TO_BLOCK    — ultimo blocco da indicizzare (default: testa della chain)
 *   Entrambi possono essere sovrascritti via variabili d'ambiente per re-indicizzazioni parziali.
 */

const CHAIN = Parachain.Moonbeam;
const DO_COMMIT = process.env.DRY_RUN !== 'true';

// Override opzionale del range di blocchi tramite variabili d'ambiente.
// Se non impostati, ogni importer parte dal blocco di deploy della propria factory.
const ENV_FROM_BLOCK = process.env.FROM_BLOCK ? parseInt(process.env.FROM_BLOCK) : undefined;
const ENV_TO_BLOCK = process.env.TO_BLOCK ? parseInt(process.env.TO_BLOCK) : undefined;

/** Restituisce il range from/to per un importer dato il suo blocco di default. */
function blockRange(defaultFrom: number): { from: number; to: number | undefined } {
    return {
        from: ENV_FROM_BLOCK ?? defaultFrom,
        to: ENV_TO_BLOCK,
    };
}

// ─── Funzioni di indicizzazione ────────────────────────────────────────────────

async function indexStellaSwapV2(): Promise<void> {
    const { from, to } = blockRange(173_814);
    await new V2EvmDexDataImporter(DexType.STELLASWAP_V2, CHAIN).startImport(from, to, DO_COMMIT);
    logger.info('---- StellaSwap V2 import complete ----');
}

async function indexBeamswapV2(): Promise<void> {
    const { from, to } = blockRange(199_156);
    await new V2EvmDexDataImporter(DexType.BEAMSWAP_V2, CHAIN).startImport(from, to, DO_COMMIT);
    logger.info('---- Beamswap V2 import complete ----');
}

/** StellaSwap V3 — Algebra fork con snapshot intra-blocco abilitati. */
async function indexStellaSwapV3(): Promise<void> {
    const { from, to } = blockRange(2_649_801);
    await new V3EvmAlgebraDataImporter(DexType.STELLASWAP_V3, CHAIN).startImport(from, to, DO_COMMIT);
    logger.info('---- StellaSwap V3 import complete ----');
}

async function indexBeamswapV3(): Promise<void> {
    const { from, to } = blockRange(3_579_833);
    await new V3EvmDataImporter(DexType.BEAMSWAP_V3, CHAIN).startImport(from, to, DO_COMMIT);
    logger.info('---- Beamswap V3 import complete ----');
}

async function indexStellaSwapV4(): Promise<void> {
    const { from, to } = blockRange(9_521_226);
    await new V4EvmAlgebraDataImporter(DexType.STELLASWAP_V4, CHAIN).startImport(from, to, DO_COMMIT);
    logger.info('---- StellaSwap V4 import complete ----');
}

async function indexStDotVault(): Promise<void> {
    const { from, to } = blockRange(StDotIndexer.ST_DOT_CREATED_AT_BLOCK);
    await new StDotIndexer().startImport(from, to, DO_COMMIT);
    logger.info('---- stDOT vault import complete ----');
}

// ─── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    logger.info('---- MOONBEAM INDEXER STARTED ----');
    if (!DO_COMMIT) logger.info('DRY_RUN mode — nessun dato verrà scritto nel database');

    // await indexStellaSwapV2();
    await indexStellaSwapV3();
    // await indexStellaSwapV4();
    // await indexStDotVault();

    // await indexBeamswapV2();
    // await indexBeamswapV3();

    logger.info('---- MOONBEAM INDEXER FINISHED ----');
}

main().catch(err => {
    logger.error('Fatal error in main', err);
    process.exit(1);
});
