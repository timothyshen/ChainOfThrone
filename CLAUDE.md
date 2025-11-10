# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chain of Thrones is an onchain strategy PvP wargame built on Monad Testnet. It's a 2-player game where each player stakes 1 MONAD as starting armies and competes to control 3 of 5 key castles on a 3x3 grid. The game combines deterministic logic with occasional randomness to simulate geopolitical strategy.

**Current Version:** v0.2
**Deployed on:** Monad Testnet
**Game Factory Contract:** 0xff1d3212c99f79a9596986767cf8d5ca1a112db7

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** TailwindCSS with Radix UI components
- **Web3:** Wagmi, Viem, ethers.js
- **Smart Contracts:** Solidity 0.8.26 with both Foundry and Hardhat
- **Package Manager:** pnpm

## Common Commands

### Frontend Development
```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Type check without emitting files
pnpm format       # Format code with Prettier
pnpm clean        # Remove .next and node_modules
```

### Smart Contract Development

**Foundry (Primary - in `contracts/` directory):**
```bash
cd contracts
forge build       # Compile contracts
forge test        # Run tests
forge fmt         # Format Solidity code
forge snapshot    # Gas snapshots
anvil            # Start local node
```

**Hardhat (Legacy - in `hardhat/` directory):**
```bash
cd hardhat
npx hardhat compile                                    # Compile contracts
npx hardhat test                                      # Run tests
npx hardhat run scripts/deploy.ts --network monadTestnet  # Deploy to Monad testnet
```

## Architecture

### Smart Contract Structure

The game uses a factory pattern with two main contracts:

- **`GameFactory.sol`** (`contracts/src/`): Factory contract that deploys individual game instances. The factory address is used as the vault for game stakes.
- **`Game.sol`** (`contracts/src/`): Core game logic implementing:
  - 3x3 grid with castle positions
  - Turn-based movement system with pending moves
  - Battle resolution with randomness
  - Stake management (1 MONAD per player)
  - Winner reward distribution (90% winner, 10% protocol)

**Important:** There are TWO contract directories:
- `contracts/` uses Foundry (preferred for new development)
- `hardhat/contracts/` uses Hardhat (legacy, may have outdated versions)

When updating contracts, ensure both are kept in sync or migrate fully to Foundry.

### Frontend Architecture

**Provider Stack (from outer to inner):**
- `GeneralProvider` (lib/providers/GeneralProvider.tsx): Configures Wagmi with Monad Testnet and React Query
- Note: There's commented-out Farcaster Frame integration in app/layout.tsx

**State Management:**
- React hooks in `lib/hooks/` handle all contract interactions
- Custom hooks follow naming: `use[Feature][Action]` (e.g., `useGameActions`, `useMakeMove`)

**Key Hooks:**
- `ReadGameContract.ts` / `ReadGameFactoryContract.ts`: Read-only contract interactions
- `useGameActions.ts`: Primary hook for game state reads (8398 bytes - complex)
- `useGameState.ts` / `useGameStateUpdates.ts`: Game state management with polling
- `useBattle.ts`: Battle resolution logic (7574 bytes)
- `useMovement.ts`: Movement validation and execution
- `useGameCreate.ts`: Create new games via factory

**Contract Integration:**
- ABIs are in `lib/contract/` (`gameAbi.ts`, `gameFactoryAbi.ts`)
- Viem client configuration in `lib/contract/client.ts`
- Event listening utilities in `lib/contract/listenEvent.ts`

### Page Structure

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout with providers
├── (game)/                     # Game route group
│   └── [gameId]/              # Dynamic game pages
├── game/                       # Game-related pages
├── explore/                    # Game explorer/lobby
└── profile/                    # User profile

components/
├── home/                       # Landing page components
├── explore/                    # Explore page components
├── gamePlay/                   # Game UI components
├── profile/                    # Profile components
├── layout/                     # Layout components (nav, etc.)
└── ui/                         # Radix UI components (shadcn/ui)
```

### Type Definitions

Game-related TypeScript types are in `lib/types/`. This includes:
- Grid cell structures
- Move/action types
- Player state
- Game status enums

## Chain Configuration

The project is configured for **Monad Testnet**:
- Chain ID: Available in hardhat.config.ts via vars
- RPC URL: https://testnet-rpc.monad.xyz/
- Block explorer: https://testnet.monadexplorer.com
- Sourcify API: https://sourcify-api-monad.blockvision.org

**Important:** The project uses environment variables for sensitive keys. Check hardhat.config.ts for required vars (MONAD_RPC_URL, PRIVATE_KEY, MONAD_CHAIN_ID).

## Development Workflow

1. **Contract changes:** Update in `contracts/src/`, compile with Foundry, then update ABIs in `lib/contract/`
2. **ABI sync:** After contract changes, export ABIs and update frontend imports
3. **Testing contract interactions:** Use hooks in `lib/hooks/` - they handle transaction states and errors
4. **New game features:** Likely requires changes in both Game.sol and corresponding hooks (e.g., useGameActions)

## Game State Management

The game uses a hybrid polling + event-driven approach:
- `useGameStateUpdates` polls for state changes
- Contract events are listened to via `listenEvent.ts`
- State is cached in React Query with background refetching

## Common Patterns

**Contract Reads:**
```typescript
// Use the Read hooks with proper typing
const { data, isLoading } = useReadContract({
  address: gameAddress,
  abi: gameAbi,
  functionName: 'functionName',
  args: [...],
});
```

**Contract Writes:**
```typescript
// Use wagmi's useWriteContract with error handling
const { writeContract, isPending } = useWriteContract();
// Write logic is typically wrapped in custom hooks (useGameActions, etc.)
```

## Known Issues & Considerations

- The Farcaster Frame integration is commented out in layout.tsx but provider code remains
- There's a duplicated contract setup (Hardhat vs Foundry) that should be consolidated
- Game state synchronization relies on polling - consider websocket subscriptions for v0.3
- The hardhat deployment script deploys both Game and GameFactory, but GameFactory should be deployed first and its address used for Game deployment

## Roadmap Context

**v0.3 planned features:**
- More players support
- Improved frontend game state sync
- Staking design
- Movement animation
- Execution record

**v0.4 planned features:**
- Chat & negotiation system
- Reward pool design
- Ranking system

When implementing new features, consider these planned additions to avoid refactoring.
