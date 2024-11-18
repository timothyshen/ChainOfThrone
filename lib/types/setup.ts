export type Game = {
  name: string;
  smartContract: string;
  players: string[];
  id: string;
  maxPlayers: number;
  status: "Open" | "In Progress" | "Completed";
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
