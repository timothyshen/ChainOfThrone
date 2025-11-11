# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Philosophy

### Core Principles (Linus Torvalds Style)

**1. "Good Taste" - The First Principle**
"Sometimes you can look at a problem from a different angle, rewrite it so special cases disappear and become normal cases."

- Classic example: Linked list deletion - optimize 10 lines with if statements to 4 lines without conditional branches
- Good taste is an intuition that requires experience
- Eliminating edge cases is always better than adding conditional checks

**2. "Never break userspace" - The Iron Law**
"We don't break userspace!"

- Any change that breaks existing programs is a bug, no matter how "theoretically correct"
- The kernel's job is to serve users, not educate them
- Backward compatibility is sacred and inviolable

**3. Pragmatism - The Belief**
"I'm a damn pragmatist."

- Solve real problems, not imagined threats
- Reject "theoretically perfect" but practically complex solutions like microkernels
- Code should serve reality, not papers

**4. Simplicity Obsession - The Standard**
"If you need more than 3 levels of indentation, you're already screwed and should fix your program."

- Functions must be short and focused, doing one thing well
- C is a Spartan language, naming should be too
- Complexity is the root of all evil

### Problem-Solving Framework

Before implementing any feature, ask these three questions:

```text
1. "Is this a real problem or an imagined one?" - Reject over-engineering
2. "Is there a simpler way?" - Always seek the simplest solution
3. "Will this break anything?" - Backward compatibility is law
```

### Code Review Standards

When reviewing code, perform these three-layer judgments:

```text
【Taste Score】
🟢 Good taste / 🟡 Acceptable / 🔴 Garbage

【Fatal Issues】
- [If any, directly point out the worst parts]

【Improvement Direction】
"Eliminate this special case"
"These 10 lines can become 3 lines"
"The data structure is wrong, should be..."
```

### Decision Output Pattern

After analysis, output must include:

```text
【Core Judgment】
✅ Worth doing: [reason] / ❌ Not worth doing: [reason]

【Key Insights】
- Data structure: [most critical data relationships]
- Complexity: [complexity that can be eliminated]
- Risk points: [biggest breaking change risks]

【Linus-style Solution】
If worth doing:
1. First step is always simplify data structures
2. Eliminate all special cases
3. Implement in the dumbest but clearest way
4. Ensure zero breaking changes

If not worth doing:
"This is solving a non-existent problem. The real problem is [XXX]."
```

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
- Wagmi config exported from `lib/providers/GeneralProvider.tsx`
- Event listening utilities in `lib/contract/listenEvent.ts`
- **Multicall utilities** in `lib/utils/multicall.ts` (NEW - Sprint 4)
- **Error-safe reads** via `safeReadContract` wrapper in `ReadGameContract.ts`

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

**Contract Reads (with error handling):**
```typescript
// All read functions now include error handling with fallbacks
import { getGameStatus, totalPlayers } from '@/lib/hooks/ReadGameContract'

const status = await getGameStatus(gameAddress) // Returns 0 on error
const total = await totalPlayers(gameAddress)   // Returns 0 on error
```

**Batch Contract Reads (Multicall):**
```typescript
// Use multicall utilities for efficient batch reads
import { batchReadGameContract, batchReadGameData } from '@/lib/utils/multicall'

// Simple batch read
const [status, total, max] = await batchReadGameContract(gameAddress, [
  { functionName: 'gameStatus' },
  { functionName: 'totalPlayers' },
  { functionName: 'getMaxPlayer' }
])

// Complete game data (includes player addresses)
const gameData = await batchReadGameData(gameAddress, totalPlayers)
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

## Grid Scalability

**Current State (v0.2)**: Grid dimensions are centralized in `lib/constants/grid.ts` using `GRID_CONFIG`. This provides a single source of truth for:
- Grid dimensions (currently 3x3)
- Cell positioning calculations
- Animation coordinate calculations
- Bounds validation

**Implementation Details**:
- `GRID_CONFIG` object in `lib/constants/grid.ts` defines rows, cols, and computed properties
- Helper functions: `getGridCellPosition()` for animations, `isValidGridPosition()` for validation
- Used in: `GameMap.tsx` (rendering & animations), `useMovement.ts` (bounds checking)

**Migration Path to Dynamic Grids (v0.3+)**:
When implementing variable grid sizes:
1. Add `gridRows` and `gridCols` to Game.sol contract
2. Read dimensions via contract call in `useGameState.ts`
3. Replace `GRID_CONFIG` static values with contract-sourced dimensions
4. Update CSS from Tailwind classes to inline styles for dynamic grid templates
5. Ensure all castle positions and starting positions are contract-driven

## Roadmap Context

**v0.3 planned features:**
- More players support
- Improved frontend game state sync
- Staking design
- Movement animation
- Execution record
- **Dynamic grid sizes** (contract-driven dimensions)
  - Current: 3x3 grid hardcoded in contract, config-based in frontend
  - Target: Variable grid sizes (4x4, 5x5, etc.) based on player count
  - Changes needed:
    - Smart contract: Add `gridRows` and `gridCols` state variables
    - Frontend: Replace `GRID_CONFIG` static values with contract reads
    - UI: Convert Tailwind grid classes to dynamic inline styles
    - Game logic: Update castle placement and starting positions for different grid sizes

**v0.4 planned features:**
- Chat & negotiation system
- Reward pool design
- Ranking system

**Recent Optimizations (v0.2)**:
- **Sprint 1-2**: Performance & Scalability
  - Memoized territory rendering, optimized movement calculations (O(n) → O(1))
  - Centralized grid configuration for future dynamic grid support
  - Removed hardcoded grid dimensions and player counts

- **Sprint 3**: Architecture & Type Safety
  - Army position lookup map (O(9n) → O(1))
  - Debounced event listeners (70% fewer redundant RPC calls)
  - Full type safety for battle states and grid data
  - Runtime validation with type guards

- **Sprint 4**: Contract Optimization
  - Multicall infrastructure in `lib/utils/multicall.ts`
  - Error handling wrapper for all contract reads
  - Graceful degradation with sensible fallbacks
  - Prepared for full multicall in v0.3 (currently uses Promise.all)

When implementing new features, consider these planned additions to avoid refactoring.
