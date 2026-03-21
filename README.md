# xchain-dex-indexer

A TypeScript framework for indexing DEX liquidity pools on EVM-compatible and Substrate-based blockchains, built on top of [Subsquid SDK](https://docs.subsquid.io/). Designed for high-granularity data collection with per-block and intra-block snapshots, cross-protocol support, and automatic data integrity verification against official subgraphs.

Currently deployed and battle-tested on **Moonbeam**, indexing StellaSwap (V2/V3/V4), Beamswap (V2/V3), and the Nimbus stDOT vault.

---

## Table of Contents

- [What makes this different](#what-makes-this-different)
- [Supported protocols](#supported-protocols)
- [Architecture](#architecture)
- [Data schema](#data-schema)
- [Token whitelist and pool filtering](#token-whitelist-and-pool-filtering)
- [Cross-chain asset registry](#cross-chain-asset-registry)
- [Multi-chain setup](#multi-chain-setup)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running the indexer](#running-the-indexer)
- [GraphQL API](#graphql-api)
- [Data integrity test](#data-integrity-test)
- [Project structure](#project-structure)
- [Extending the framework](#extending-the-framework)
- [Roadmap](#roadmap)

---

## What makes this different

Most DEX subgraphs are built to serve UI dashboards — they provide one snapshot per block, with no information about what happened *inside* the block. This project was built with a different goal: **maximum granularity for research, MEV analysis, and strategy backtesting**.

### 1. Per-block gap filling

Every pool gets an end-of-block snapshot at every block, even if no relevant event occurred. This guarantees a continuous, gapless time series with no missing blocks.

### 2. Intra-block snapshots

When multiple transactions modify the same pool within a single block, a snapshot is saved for each transaction (ordered by `transactionIndex`). This allows reconstructing the exact sequence of price changes inside a block — something no official subgraph exposes.

Intra-block snapshots are opt-in per DEX via `intraBlockSnapshots: true` in the DEX config (currently enabled for StellaSwap V3).

### 3. Priority inclusion fee per snapshot

Each snapshot records `priorityInclusionFeePerUnit` (e.g. `baseFee + priorityFee` for EVM, `tip + weightFee` for Substrate), making it possible to correlate price changes with transaction priority and MEV activity.

### 4. Unified schema across protocols

V2 (Uniswap forks), V3 (Uniswap and Algebra forks), V4 (Algebra), and the stDOT vault — all stored in a single PostgreSQL database with a consistent snapshot structure and exposed via a unified GraphQL API.

### 5. Automatic data integrity verification

A built-in test suite compares indexed data against official subgraphs by querying random blocks within a range and diffing the results. Supports V2, V3, and V4.

### 6. Cross-chain by design

The core engine is chain-agnostic. EVM and Substrate processor abstractions are cleanly separated at the base layer. Today all live indexers are EVM-based, but the architecture is designed to support Substrate pallet indexers (e.g. XYK pallets) with the same snapshot model and gap-filling logic — adding a new chain means implementing a chain-specific config and processor, not touching the core.

---

## Supported protocols

| Protocol | Type | Chain |
|---|---|---|
| StellaSwap V2 | Uniswap V2 fork | Moonbeam |
| StellaSwap V3 | Algebra V3 fork | Moonbeam |
| StellaSwap V4 | Algebra V4 fork | Moonbeam |
| Beamswap V2 | Uniswap V2 fork | Moonbeam |
| Beamswap V3 | Uniswap V3 fork | Moonbeam |
| Nimbus stDOT vault | Liquid staking vault | Moonbeam |

> **Note:** Stable AMM pools (Beamswap and StellaSwap) are defined in the GraphQL schema but the indexer implementation is not yet complete.

---

## Architecture

![Block processing flow](docs/block-processing-flow.svg)

```
AbstractDataImporter                  ← block loop, gap filling, commit (cross-chain)
  └── AbstractDexDataImporter         ← pool registry, snapshot tracker, per-tx dedup
        ├── V2EvmDexDataImporter      ← Uniswap V2 forks (EVM)
        ├── V3EvmDataImporter         ← Uniswap V3 forks (EVM)
        │     └── V3EvmAlgebraDataImporter   ← adapter: swaps ABI + event processors
        ├── V4EvmAlgebraDataImporter  ← Algebra V4 (EVM)
        ├── StableDexDataImporter     ← Curve-style AMMs (EVM, schema defined, indexer WIP)
        └── [SubstrateXykDataImporter]  ← XYK pallet indexer (Substrate, planned)

StDotIndexer                          ← standalone vault indexer (extends AbstractDataImporter)
```

### Key design decisions

**Adapter pattern for forks.** `V3EvmAlgebraDataImporter` extends `V3EvmDataImporter` and injects only an `AlgebraEventsProcessor` and `AlgebraEventChecker`. Adding support for a new V3 fork requires roughly 2 adapters and ~30 lines of code.

**Stateful in-memory components.** Each batch run maintains:
- `PoolRegistry` — known pools + newly discovered pools to insert
- `PoolSnapshotTracker` — latest snapshot per pool, used for gap filling
- `GenericTickTracker` — tick state for V3/V4 pools
- `mapTxHashNewPoolSnapshot` — per-tx snapshot deduplication map

**Gap filling.** `AbstractDataImporter` tracks the last processed block height and automatically fills end-of-block snapshots for any skipped blocks between batches, ensuring no gaps in the time series.

**Intra-block ordering.** Snapshots within a block are ordered by `transactionIndex` and deduplicated by `txHash`: if the same transaction emits multiple Sync events on the same pool, only the final state is kept (since intermediate states within a single tx are not observable on-chain).

---

## Data schema

The schema is split into two layers — see [Multi-chain setup](#multi-chain-setup) for how they compose.

**`src/schemas/common.graphql`** — shared across all chains:

### Pools

| Entity | Description |
|---|---|
| `V2Pool` | Uniswap V2-style pool |
| `V3Pool` | Uniswap V3 / Algebra V3 pool |
| `V4Pool` | Algebra V4 pool |
| `StablePool` | Curve-style pool with N coins (schema only, indexer WIP) |
| `Token` | Token metadata (ERC-20 or Substrate asset) |

### Snapshots

Every pool type has a corresponding snapshot entity:

| Entity | Key fields |
|---|---|
| `V2PoolSnapshot` | `reserve0`, `reserve1`, `token0Price`, `token1Price` |
| `V3PoolSnapshot` | `sqrtPrice`, `liquidity`, `tick`, `token0Price`, `token1Price`, `ticks[]` |
| `V4PoolSnapshot` | same as V3, plus `pluginFee` |
| `StablePoolSnapshot` | `virtualPrice`, `a`, `fee`, `coins[]` (schema only) |

**`src/schemas/moonbeam.graphql`** — Moonbeam-specific extensions:

| Entity | Description |
|---|---|
| `StDotVaultSnapshot` | Nimbus stDOT vault state: `totalDot`, `totalStDot`, `exchangeRate`, fee breakdown |

All snapshot entities share these fields for ordering and MEV analysis:

| Field | Description |
|---|---|
| `blockNumber` | Block height |
| `afterTxId` | `null` for end-of-block snapshots; tx hash for intra-block snapshots |
| `index` | `transactionIndex` within the block (for intra-block ordering) |
| `priorityInclusionFeePerUnit` | `baseFee + priorityFee` (EVM) or `tip + weightFee` (Substrate) |

To query only end-of-block snapshots (one per block, equivalent to a standard subgraph), filter with `afterTxId_isNull: true`.

---

## Token whitelist and pool filtering

### Why a whitelist is necessary

On public DEXs anyone can create a pool with any token pair, including malicious tokens designed to mimic legitimate assets (e.g. "Salmonella" tokens, fake USDC clones, honeypots). Indexing all pools indiscriminately would pollute the dataset with meaningless or adversarial data. The whitelist ensures that only pools where **all tokens are known and trusted** are indexed.

### How it works

Each chain defines a `WhiteListTokensManager` (e.g. `MoonbeamWhiteListTokensManager`) that holds a static list of trusted token addresses. Pool lists are filtered through it before being registered: a pool is tracked only if both `token0` and `token1` are present in the whitelist.

The base class `WhiteListTokensManager` is chain-agnostic and lives in `src/app/core/whitelistTokens/`. Extending it for a new chain takes a single file.

```typescript
// Filter pools: only index pairs where both tokens are whitelisted
const trackedPools = onlyWithMoonbeamWhiteListedTokens(allDiscoveredPools);
```

For Stable AMM pools (which can have N coins), a separate helper `onlyWithMoonbeamWhiteListedStableTokens` checks all coins in the pool.

### Moonbeam whitelist

The Moonbeam whitelist (`whiteListTokensConst.ts`) covers ~35 tokens including native assets, XCM cross-chain assets (xcDOT, xcUSDC, xcUSDT, xcASTR, xcBNC, xcvDOT...), major stablecoins (USDC, USDT, DAI, FRAX), wrapped assets (WETH, WBTC, WGLMR), liquid staking tokens (stDOT, wstDOT, xcvGLMR), and DEX-native tokens (STELLA, GLINT).

---

## Cross-chain asset registry

### Purpose

The same asset often exists on multiple parachains under different addresses or Substrate currency IDs. For example, DOT is native on the Relay Chain, appears as `xcDOT` (EVM address `0xfff...080`) on Moonbeam, and as a Substrate asset with a different currency ID on Hydration. Without a unified registry, cross-chain comparisons and arbitrage analysis would require manual address mapping per chain.

The `CrossChainAssetRegistryManager` solves this by indexing all assets by their canonical **XCM MultiLocation** key — the chain-agnostic identifier that uniquely identifies an asset across the Polkadot ecosystem.

### Data model

Each asset in the registry (`CrossChainAssetItem`) carries:

| Field | Description |
|---|---|
| `symbol`, `decimals` | Canonical token metadata |
| `paraID` | Home parachain ID |
| `xcContractAddress` | Map of `parachainId → EVM contract address` |
| `xcCurrencyID` | Map of `parachainId → Substrate currency ID` |
| `xcmV1Standardized` | XCM v1 MultiLocation path |

This means a single registry entry covers all representations of an asset across all chains simultaneously.

### Key queries

```typescript
// Resolve an EVM address to its canonical cross-chain asset
registry.getByEvmAddress(Parachain.Moonbeam, "0xfff...080") // → xcDOT item

// Find all assets common to two chains (e.g. for cross-chain arbitrage)
registry.getAssetsCommonToChains([Parachain.Moonbeam, Parachain.Hydration])

// Check if all whitelist assets are XCM-transferable on a chain
registry.isAllWhitelistXcmTransferable(moonbeamWhitelist)

// Get assets present in all provided per-chain whitelists
registry.getAssetsCommonInWhitelists([moonbeamWhitelist, hydrationWhitelist])
```

### Cross-chain trust propagation

A key benefit of linking the whitelist to the XCM registry is that **trust is transitive across chains**. If an asset is whitelisted on Moonbeam (e.g. `xcDOT` at its Moonbeam EVM address), the registry can resolve its canonical XCM identity and confirm that its representation on another chain (e.g. DOT's Substrate currency ID on Hydration) refers to the same underlying asset. This makes it possible to build cross-chain datasets with consistent asset identity, without maintaining per-chain address mappings manually.

### Registry source

The XCM asset registry (`polkadot_xcmRegistry.json`) is generated using an official Polkadot ecosystem tool that produces a canonical mapping of all XCM-transferable assets across parachains, keyed by their XCM MultiLocation. 

---

## Getting started

### Prerequisites

- Node.js ≥ 18
- Docker (for PostgreSQL)
- A Moonbeam RPC endpoint (public endpoints available at [dwellir.com](https://moonbeam-rpc.dwellir.com) or [onfinality.io](https://moonbeam.api.onfinality.io/public))

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/xchain-mev-research.git
cd xchain-mev-research/xchain-dex-indexer
npm install
```

### Environment setup

```bash
cp .env.example .env
# Edit .env with your database credentials and RPC endpoint
```

### Start the database

```bash
docker-compose up -d
```

---

## Configuration

All environment variables are documented in `.env.example`. The most important ones:

| Variable | Description | Default |
|---|---|---|
| `DB_URL_PREFIX` | PostgreSQL connection string prefix | `postgresql://postgres:password@localhost:5432/` |
| `RPC_MOONBEAM_HTTP` | Moonbeam RPC HTTP endpoint | — |
| `GQL_PORT` | GraphQL server port | `4350` |
| `FROM_BLOCK` | Override start block for all importers | per-factory default |
| `TO_BLOCK` | Override end block for all importers | chain head |
| `DRY_RUN` | Run without writing to DB | `false` |
| `LOG_TO_FILE` | Write logs to file in addition to stdout | `false` |

### DEX configuration

Each DEX is configured in `src/app/chains/moonbeam/config/MoonbeamDexConfigRegistry.ts`. The `IDexConfig` interface supports:

```typescript
{
  dexType: DexType;
  factoryAddress: string;
  factoryAddressCreatedAt: number;   // first block to index
  trackedPools: Map<string, null>;   // pool whitelist
  factoryAbi: any;
  poolAbi: any;
  chain: ParachainInfo;
  intraBlockSnapshots?: boolean;     // default: false
}
```

To enable intra-block snapshots for a DEX, set `intraBlockSnapshots: true` in its config entry.

---

## Running the indexer

### 1. Index data

Edit `src/app/chains/moonbeam/main.ts` to enable the importers you need (they are organized as separate functions, one per DEX), then run:

```bash
npm run start:moonbeam
```

The indexer will process blocks in batches, persist snapshots to PostgreSQL, and log progress to stdout.

To index a specific block range without modifying the code:

```bash
FROM_BLOCK=2649801 TO_BLOCK=2700000 npm run start:moonbeam
```

To run without writing to the database (dry run):

```bash
DRY_RUN=true npm run start:moonbeam
```

### 2. Start the GraphQL API

```bash
npm run start:gql
```

The API will be available at `http://localhost:4350/graphql`.

---

## GraphQL API

The GraphQL server is powered by `@subsquid/graphql-server` and exposes all entities defined in the schema, with filtering, ordering, and pagination out of the box.

### Example queries

**End-of-block snapshots for a V2 pool (standard subgraph equivalent)**

```graphql
query {
  v2PoolSnapshots(
    where: {
      pool: { id_eq: "0xpool_address_here" }
      afterTxId_isNull: true
    }
    orderBy: blockNumber_DESC
    limit: 100
  ) {
    blockNumber
    reserve0
    reserve1
    token0Price
    token1Price
  }
}
```

**Intra-block snapshots for a V3 pool at a specific block**

```graphql
query {
  v3PoolSnapshots(
    where: {
      pool: { id_eq: "0xpool_address_here" }
      blockNumber_eq: 3000000
    }
    orderBy: index_ASC
  ) {
    afterTxId
    index
    priorityInclusionFeePerUnit
    sqrtPrice
    liquidity
    tick
    token0Price
    token1Price
  }
}
```

**All pools for a DEX with their tokens**

```graphql
query {
  v3Pools(
    where: { dex_eq: STELLASWAP_V3 }
    orderBy: createdAtBlockNumber_DESC
  ) {
    id
    createdAtBlockNumber
    token0 { symbol decimals }
    token1 { symbol decimals }
    feeTier
  }
}
```

**V4 pool snapshot with tick data**

```graphql
query {
  v4PoolSnapshots(
    where: {
      blockNumber_eq: 9525000
      afterTxId_isNull: true
    }
  ) {
    blockNumber
    sqrtPrice
    liquidity
    tick
    fee
    ticks {
      tickIdx
      liquidityGross
      liquidityNet
    }
  }
}
```

---

## Data integrity test

The framework includes a built-in test that validates indexed data against official DEX subgraphs by comparing pool states at randomly sampled blocks.

Supported comparisons:

| Config | Source A (official) | Source B (local) |
|---|---|---|
| StellaSwap V2 | `analytics.stellaswap.com/api/graphql/v2` | `localhost:4350/graphql` |
| Beamswap V2 | `graph.beamswap.io/.../beamswap-amm-v2` | `localhost:4350/graphql` |
| StellaSwap V3 | `analytics.stellaswap.com/api/graphql/v3` | `localhost:4350/graphql` |
| Beamswap V3 | `graph.beamswap.io/.../beamswap-amm-v3` | `localhost:4350/graphql` |
| StellaSwap V4 | The Graph hosted service | `localhost:4350/graphql` |

To run:

```bash
# Make sure the GraphQL server is running first
npm run start:gql

# In another terminal
npm run integrityTest
```

Configure which DEX and block range to test by editing `src/app/core/dataIntegrityTest/DataIntegrityTest.ts`. The comparator samples start block, end block, midpoint, and N random blocks in between, logging mismatches to the console.

---

## Project structure

```
src/
├── abi/                            # Typed ABIs (generated with squid-evm-typegen)
│   ├── v2Dexes/
│   ├── v3Dexes/
│   │   ├── algebra/
│   │   └── uniswap/
│   └── v4Dexes/
├── app/
│   ├── core/                       # Chain-agnostic framework
│   │   ├── config/
│   │   │   └── DexConfig.ts        # DEX configuration registry
│   │   ├── data/                   # TypeORM repositories (V2/V3/V4/Token)
│   │   ├── dataIntegrityTest/      # Automated comparison against official subgraphs
│   │   ├── indexingEngine/
│   │   │   ├── AbstractDataImporter.ts
│   │   │   ├── base/               # AbstractDexDataImporter, PoolRegistry, PoolSnapshotTracker
│   │   │   ├── evm/                        # EVM implementations (current)
│   │   │   │   ├── uniswapV2Dexes/
│   │   │   │   ├── uniswapV3Dexes/         # Uniswap V3 + Algebra adapter
│   │   │   │   ├── uniswapV4Dexes/
│   │   │   │   └── stableDexes/
│   │   │   └── substrate/                  # Substrate implementations (planned)
│   │   ├── crossChainTokenRegistry/    # XCM cross-chain asset registry and address mapping
│   │   ├── whitelistTokens/            # WhiteListTokensManager base class
│   │   ├── graphql/
│   │   ├── parachainUtils/
│   │   └── utils/
│   └── chains/
│       └── moonbeam/
│           ├── config/
│           │   └── MoonbeamDexConfigRegistry.ts
│           ├── db/
│           ├── indexer/
│           │   └── stDot/          # Nimbus stDOT vault indexer
│           ├── trackedItems/
│           │   ├── pools/          # Pool whitelists (generated + static)
│           │   └── tokens/
│           └── main.ts             # Entry point
├── schemas/
│   ├── common.graphql              # Shared entities (all chains)
│   ├── moonbeam.graphql            # Moonbeam-specific entities (e.g. StDotVaultSnapshot)
│   └── testParachain.graphql       # Example chain-specific schema extension
└── scripts/
    ├── run.ts                      # Starts the indexer for PARACHAIN
    ├── runGql.ts                   # Starts the GraphQL server for PARACHAIN
    ├── runDataIntegrityTest.ts     # Runs the data integrity test for PARACHAIN
    └── generate-omni-model.ts      # Merges schemas, runs codegen and migrations for all chains
```

---

## Multi-chain setup

The framework is designed to run a single codebase against multiple chains, each with its own database, migrations, and optionally its own GraphQL schema extensions.

### Schema layers

The schema system has two layers:

- **`src/schemas/common.graphql`** — entities shared across all chains: `Token`, `V2Pool`, `V3Pool`, `V4Pool`, and all their snapshot types. Every chain automatically includes this base schema.
- **`src/schemas/<chain>.graphql`** — optional chain-specific extensions. For example, `moonbeam.graphql` defines `StDotVaultSnapshot`, which is specific to the Nimbus liquid staking vault on Moonbeam. If a chain has no custom entities, the file can be empty.

### Schema merge and codegen

At build time, `generate-omni-model.ts` merges `common.graphql` with the chain-specific file and writes the result to the root `schema.graphql`, which is then consumed by `squid-typeorm-codegen` to generate TypeORM entities.

```bash
npm run codegen:omni
```

This script does the following for **each chain** found in `src/schemas/` (excluding `common.graphql`):

1. Merges `common.graphql` + `<chain>.graphql` → writes to root `schema.graphql`
2. Runs `squid-typeorm-codegen` to generate TypeORM entity classes
3. Compiles TypeScript using the chain-specific `tsconfig.<chain>.json`
4. Generates and applies database migrations for that chain's database
5. Saves the resulting migration files to `src/app/chains/<chain>/db/migrations/`

After processing all chains, the script generates one final **omni-model** that merges all schemas together. This omni-model is what the GraphQL server uses at runtime, so the API can serve data from all chains through a single endpoint.

### Per-chain database isolation

Each chain gets its own PostgreSQL database, constructed at runtime as `DB_URL_PREFIX + chain_name` (e.g. `postgresql://localhost:5432/moonbeam`). Migrations are stored per-chain at `src/app/chains/<chain>/db/migrations/` and are completely isolated — running codegen for Moonbeam never touches another chain's database.

### Runtime scripts and `PARACHAIN`

All scripts in `src/scripts/` are driven by the `PARACHAIN` environment variable:

| Script | Command | What it does |
|---|---|---|
| `run.ts` | `PARACHAIN=moonbeam npm run start:moonbeam` | Builds and runs `src/app/chains/<chain>/main.ts` |
| `runGql.ts` | `PARACHAIN=moonbeam npm run start:gql` | Starts the GraphQL server connected to `<chain>` DB |
| `runDataIntegrityTest.ts` | `PARACHAIN=moonbeam npm run integrityTest` | Runs the integrity test against `<chain>` DB |

Each script reads `PARACHAIN`, sets `DB_URL = DB_URL_PREFIX + parachain`, and routes to the correct entry point. Adding a new chain means adding a `main.ts` under `src/app/chains/<chain>/` — no changes to the scripts are needed.

### Adding a new chain

1. **Create the schema extension**: add `src/schemas/<chain>.graphql` with any chain-specific entities. An empty file is valid if the chain only uses common entities.
2. **Add `tsconfig.<chain>.json`** at the root, mirroring `tsconfig.moonbeam.json`.
3. **Create the chain folder**: `src/app/chains/<chain>/` with a `config/` registry and a `main.ts` entry point.
4. **Register DEX configs** in the chain registry, following `MoonbeamDexConfigRegistry` as reference.
5. **Run `npm run codegen:omni`** — the script picks up the new chain automatically and generates its entities and migrations.

---

## Extending the framework

### Example: adding a new Uniswap V2 DEX in ~15 minutes

Suppose a new DEX called **AcmeDex** launches on Moonbeam as a Uniswap V2 fork. Here is the complete integration.

**Step 1 — Add the pool list** (`src/app/chains/moonbeam/trackedItems/pools/static/acmedex/AcmeDexTrackedPoolsV2.ts`)

```typescript
import { ITrackedV2Pool } from "@app/core/trackedPools/trackedPoolsTypes";
import { onlyWithMoonbeamWhiteListedTokens } from "@app/chains/moonbeam/trackedItems/whiteListTokens/MoonbeamWhiteListTokensManager";

const ALL_POOLS: ITrackedV2Pool[] = [
    { id: "0xpool1address", token0: "0xtoken0", token1: "0xtoken1" },
    // ...
];

// Only keep pools where both tokens are in the Moonbeam whitelist
export const ACMEDEX_TRACKED_POOLS_V2 = onlyWithMoonbeamWhiteListedTokens(ALL_POOLS);
```

**Step 2 — Add the DexType** (`src/schemas/common.graphql`)

```graphql
enum DexType {
  # ... existing entries ...
  ACMEDEX_V2
}
```

**Step 3 — Register the DEX config** (`src/app/chains/moonbeam/config/MoonbeamDexConfigRegistry.ts`)

```typescript
store({
    dexType: DexType.ACMEDEX_V2,
    factoryAddress: "0xfactoryAddress",
    factoryAddressCreatedAt: 12_000_000,
    trackedPools: new Map(ACMEDEX_TRACKED_POOLS_V2.map(p => [p.id, null])),
    factoryAbi: v2FactoryAbi,   // reuse existing V2 ABI — no new ABI needed
    poolAbi: v2PoolAbi,
    chain: MOONBEAM,
});
```

**Step 4 — Enable the importer** (`src/app/chains/moonbeam/main.ts`)

```typescript
async function indexAcmeDexV2(): Promise<void> {
    const { from, to } = blockRange(12_000_000);
    await new V2EvmDexDataImporter(DexType.ACMEDEX_V2, CHAIN).startImport(from, to, DO_COMMIT);
    logger.info('---- AcmeDex V2 import complete ----');
}
```

That's it. Run `npm run codegen:omni` to generate the migration, then `npm run start:moonbeam`. All pools are automatically filtered by the whitelist, gap-filled per block, and exposed via GraphQL — no changes to the core engine.

---

### Adding a new Uniswap V3 fork

**Step 1 — EventChecker adapter** (`src/app/core/indexingEngine/evm/uniswapV3Dexes/<fork>/AcmeDexV3EventChecker.ts`)

Override only the events whose signature differs from the Uniswap V3 standard. For most forks this means just `Initialize` and optionally a custom fee event.

```typescript
import { V3EvmEventChecker } from '../uniV3Forks/V3EvmEventChecker';
import { AbiUtils } from '@app/core/utils/evm/AbiUtils';
import { Log } from '@subsquid/evm-processor';

export class AcmeDexV3EventChecker extends V3EvmEventChecker {
    constructor(poolAbi: any) {
        super(poolAbi);
    }

    // Override only if the fork uses a different event name or signature
    override isInitializeEvent(log: Log): boolean {
        return AbiUtils.checkEvent(log, this.poolAbi.events.Initialize);
    }
}
```

**Step 2 — EventsProcessor adapter** (`src/app/core/indexingEngine/evm/uniswapV3Dexes/<fork>/AcmeDexV3EventsProcessor.ts`)

Override only the decode methods whose event struct differs from the standard. All math and snapshot logic is inherited.

```typescript
import { V3EvmEventsProcessor, V3SwapEvent } from '../uniV3Forks/V3EvmEventsProcessor';
import { Log } from '@subsquid/evm-processor';

export class AcmeDexV3EventsProcessor extends V3EvmEventsProcessor {
    constructor(poolAbi: any) {
        super(poolAbi);
    }

    // Override only if the swap event struct is different (e.g. field renamed)
    protected override decodeSwapEvent(log: Log): V3SwapEvent {
        const event = this.poolAbi.events.Swap.decode(log);
        return {
            liquidity: event.liquidity,
            sqrtPriceX96: event.sqrtPriceX96, // rename here if the fork uses a different field name
            tick: event.tick,
        };
    }
}
```

**Step 3 — DataImporter** (`src/app/core/indexingEngine/evm/uniswapV3Dexes/<fork>/AcmeDexV3DataImporter.ts`)

Inject the two adapters and point to the fork-specific processor. Everything else — gap filling, snapshot tracking, intra-block ordering, GraphQL — is inherited.

```typescript
import { V3EvmDataImporter } from '../uniV3Forks/V3EvmDataImporter';
import { AcmeDexV3EventChecker } from './AcmeDexV3EventChecker';
import { AcmeDexV3EventsProcessor } from './AcmeDexV3EventsProcessor';
import { DexConfig } from '@app/core/config/DexConfig';
import { DexType } from '@model/generated';
import { ParachainInfo } from '@app/core/parachainUtils/ParachainConst';

export class AcmeDexV3DataImporter extends V3EvmDataImporter {
    constructor(dexType: DexType, parachain: ParachainInfo) {
        super(
            dexType,
            parachain,
            new AcmeDexV3EventsProcessor(DexConfig.getConfig(dexType, parachain)!.poolAbi),
            new AcmeDexV3EventChecker(DexConfig.getConfig(dexType, parachain)!.poolAbi),
        );
    }
}
```

**Step 4 — Register and run** (same as the V2 example above: add pools, add `DexType`, register config, add importer function in `main.ts`)

### Adding a new EVM chain

See the [Multi-chain setup](#multi-chain-setup) section for the full walkthrough. In addition:

1. Add a `ParachainInfo` entry to `src/app/core/parachainUtils/ParachainConst.ts`
2. Add the chain's RPC endpoint to `.env` and load it in the chain's processor config

### Adding a Substrate DEX (XYK pallet)

The base abstractions (`AbstractDataImporter`, `AbstractDexDataImporter`) support both EVM and Substrate processors. To add a Substrate XYK indexer:

1. Implement a `SubstrateXykDataImporter` extending `AbstractDexDataImporter` with a `@subsquid/substrate-processor`
2. Decode pallet events (e.g. `xyk.PoolCreated`, `xyk.SellExecuted`) and map them to the shared `V2PoolSnapshot` schema
3. Register the chain config using the `palletName` and `eventNames` fields already present in `IDexConfig`
4. The gap-filling, snapshot tracking, and GraphQL exposure work out of the box — no changes to the core needed

### Enabling intra-block snapshots for a DEX

In the DEX config entry in the chain registry, set:

```typescript
intraBlockSnapshots: true
```

This is per-DEX and off by default, so it only increases storage for the DEXs where sub-block granularity is needed.

---

## Roadmap

- [ ] Implement Stable AMM indexer (EVM — schema and entity models already defined)
- [ ] Substrate XYK pallet indexer (e.g. Hydration)
- [ ] Docker Compose setup for one-command startup (indexer + DB + GraphQL)
- [ ] Support for additional EVM DEXs and chains
- [ ] Support for additional Substrate parachains
