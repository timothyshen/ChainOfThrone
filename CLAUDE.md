# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chain of Thrones is an onchain strategy PvP wargame on Monad Testnet. 2-player game where each player stakes 1 MONAD and competes to control 3 of 5 castles on a 3x3 grid.

**Current Version:** v0.2
**Game Factory Contract:** 0xff1d3212c99f79a9596986767cf8d5ca1a112db7

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Radix UI
- **Web3:** Wagmi, Viem, ethers.js
- **Smart Contracts:** Solidity 0.8.26 (Foundry primary, Hardhat legacy)
- **Package Manager:** pnpm

## Common Commands

### Frontend
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm format       # Prettier
```

### Smart Contracts (Foundry - preferred)
```bash
cd contracts
forge build       # Compile
forge test        # Run tests
forge fmt         # Format
```

### Smart Contracts (Hardhat - legacy)
```bash
cd hardhat
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network monadTestnet
```

## Architecture

### Contract Structure
Two main contracts using factory pattern:
- **`GameFactory.sol`** (`contracts/src/`): Deploys game instances, acts as stake vault
- **`Game.sol`** (`contracts/src/`): Core game logic - 3x3 grid, turn-based moves, battle resolution, stake management

**Note:** Two contract directories exist - `contracts/` (Foundry, preferred) and `hardhat/contracts/` (legacy). Keep in sync or migrate fully to Foundry.

### Frontend Structure
```
app/                    # Next.js App Router pages
components/
├── gamePlay/           # Game UI components
├── profile/            # Profile components
├── layout/             # Layout components
└── ui/                 # Radix UI (shadcn/ui)
lib/
├── hooks/              # Contract interactions & game state
├── contract/           # ABIs, client config
├── constants/          # Grid config, animations
├── types/              # TypeScript definitions
└── utils/              # Multicall, helpers
```

### Key Hooks
- `ReadGameContract.ts` / `ReadGameFactoryContract.ts`: Read-only contract calls
- `useGameState.ts` / `useGameStateUpdates.ts`: Game state with polling
- `useBattle.ts`: Battle resolution
- `useMovement.ts`: Movement validation
- `useGameCreate.ts`: Game creation via factory

### State Management
Hybrid polling + event-driven approach:
- `useGameStateUpdates` polls for changes
- Contract events via `lib/contract/listenEvent.ts`
- React Query caching with background refetch

## Development Workflow

1. **Contract changes:** Update in `contracts/src/`, compile with Foundry, update ABIs in `lib/contract/`
2. **ABI sync:** After contract changes, export ABIs and update frontend imports
3. **Testing:** Use hooks in `lib/hooks/` - they handle transaction states and errors

## Grid Configuration

Grid dimensions centralized in `lib/constants/grid.ts` via `GRID_CONFIG`. Helper functions: `getGridCellPosition()`, `isValidGridPosition()`.

## Chain Configuration

**Monad Testnet:**
- RPC: https://testnet-rpc.monad.xyz/
- Explorer: https://testnet.monadexplorer.com

## Roadmap

**v0.3:** More players, improved state sync, staking design, movement animation, dynamic grid sizes
**v0.4:** Chat/negotiation, reward pool, ranking system
