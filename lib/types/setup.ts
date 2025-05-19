interface GameStatus {
  Open: "Open";
  InProgress: "In Progress";
  Completed: "Completed";
}

export type Game = {
  gameAddress: `0x${string}`;
  totalPlayers: number;
  roundNumber: number;
  maxPlayers: number;
  status: number;
};

export type MakeMoveArgs = {
  player: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  units: number;
};

export interface GameHistory {
  gameAddress: `0x${string}`;
  winner: `0x${string}`;
  timestamp: number;
  totalRounds: number;
  players: `0x${string}`[];
}

export interface PlayerRank {
  address: `0x${string}`;
  wins: number;
  totalGames: number;
  lastWinTimestamp: number;
  winRate: number;
}
