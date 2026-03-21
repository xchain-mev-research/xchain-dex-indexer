# Contributing to xchain-dex-indexer

Thanks for your interest in contributing. This document covers the basics.

---

## Before you start

For anything non-trivial — a new feature, a refactor, a new chain or DEX — **open an issue first**. This avoids wasted effort and lets us align on the approach before you write code.

For small fixes (typos, obvious bugs, documentation) feel free to open a PR directly.

---

## Setting up the project

```bash
git clone https://github.com/xchain-mev-research/xchain-dex-indexer.git
cd xchain-dex-indexer
npm install
cp .env.example .env
# Edit .env with your database credentials and RPC endpoint
docker-compose up -d
```

See the [README](./README.md) for full setup instructions.

---

## Good first issues

If you're looking for a place to start, check the issues labeled [`good first issue`](https://github.com/xchain-mev-research/xchain-dex-indexer/issues?q=is%3Aissue+label%3A%22good+first+issue%22). Current open ones:

- **Stable AMM indexer** — schema and entity models already defined, indexer implementation missing
- **Substrate XYK pallet indexer (Hydration)** — base abstractions already support Substrate processors

---

## Guidelines

**Language** — all code comments, commit messages, PR descriptions, and documentation must be in English.

**Scope** — keep PRs focused on a single concern. A PR that fixes a bug and adds a new feature at the same time is hard to review.

**Code style** — follow the existing patterns in the codebase. No new linter rules or formatter changes without prior discussion.

**Tests** — if you're adding a new importer or modifying indexing logic, run the data integrity test against the relevant subgraph before submitting. See [Data integrity test](./README.md#data-integrity-test) in the README.

**Commit messages** — use the format `type: short description`, e.g.:
```
feat: add Hydration XYK pallet indexer
fix: correct tick deduplication in V3 intra-block snapshots
chore: update Moonbeam pool whitelist
```

---

## Adding a new DEX or chain

The README has step-by-step guides with code examples:
- [Adding a new Uniswap V2 DEX](./README.md#example-adding-a-new-uniswap-v2-dex-in-15-minutes)
- [Adding a new Uniswap V3 fork](./README.md#adding-a-new-uniswap-v3-fork)
- [Adding a new EVM chain](./README.md#adding-a-new-evm-chain)
- [Adding a Substrate DEX (XYK pallet)](./README.md#adding-a-substrate-dex-xyk-pallet)

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
