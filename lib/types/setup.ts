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

export type PlayerRank = {
  id: string;
  walletAddress: string;
  wins: number;
};

export type MakeMoveArgs = {
  player: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  units: number;
};
