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
  currentPlayer: string;
  moveAction: boolean;
}
