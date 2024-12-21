import { Player } from "./game";

export enum GameStatusEnum {
  NOT_STARTED = "Not Started",
  ONGOING = "Ongoing",
  COMPLETED = "Completed",
}

export interface PlayerState {
  address: string;
  roundSubmitted: boolean;
}

export interface GameStatusProps {
  isLoading: boolean;
  currentPlayer: string;
  gameStatus: GameStatusEnum;
  totalPlayer: number;
  maxPlayer: number;
  playerAddresses: PlayerState[];
  setGameStatus: (status: GameStatusEnum) => void;
  setTotalPlayer: (total: number) => void;
  fetchGameData: () => void;
}
