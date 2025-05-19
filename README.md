# Chain of Thrones

Current version: v0.2

Available on Sepolia Testnet

> Game Factory Contract Address: 0xff1d3212c99f79a9596986767cf8d5ca1a112db7

Chain of Thrones is an onchain strategy pvp wargame that immerses players in a simplified geopolitics simulation. Designed for 2-3 players, each participant stakes 10 USDC as their starting armies and vies to control 3 of 5 key castles on a 3x3 grid. Players move armies, negotiate strategic loans, and resolve conflicts using a mix of deterministic logic and occasional randomness, simulating the unpredictability of real-world geopolitics. Fully autonomous AI can drive gameplay, making Chain of Thrones an engaging and tactical challenge for both human and automated competitors.

## Project Structure

```
chain-of-throne/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── layout/          # Layout components
│   ├── ui/              # UI components
│   └── ...
├── lib/                 # Utility functions and hooks
│   ├── utils/           # General utilities
│   ├── hooks/           # React hooks
│   ├── providers/       # Context providers
│   └── ...
├── contracts/           # Smart contracts
├── public/              # Static assets
└── ...
```

## How to Play

1. Create a game
2. Add players
3. Make moves
4. Win the game

## How to Create a Game

1. Go to the Explorer page
2. Click on the "Create Game" button

## Game Rules

- Each player starts with 10 USDC
- Each player can move their armies to an adjacent cell on the grid
- Each player can declare war on an adjacent player
- Each player can resolve a conflict with an adjacent player
- The game ends when one player controls 3 of the 5 key castles

For more details, please refer to the "How to Play" Button on the Home Page.

## Game Status

- `0`: Game not started
- `1`: Game started
- `2`: Game ended

## Roadmap

### v0.3

- Add more players
- Improve game state sync in the frontend
- Add staking design
- Movement animation
- Execution record

### v0.4

- Add chat & negotiation system
- Reward pool design
- Ranking system

## Development

### Prerequisites

- Node.js 18 or higher
- pnpm 9 or higher

### Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Type checking
pnpm typecheck
```

## How to Contribute

- Raise an issue
- Submit a PR

## License

MIT
