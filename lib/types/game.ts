export type Territory = {
  id: string;
  name: string;
  x: number;
  y: number;
  player: `0x${string}`;
  units: bigint[];
  isCastle: boolean;
};
export interface Army {
  id: string;
  x: number;
  y: number;
  size: number;
  owner: string;
  isMoving: boolean;
}

export type Move = {
  player: `0x${string}`;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  units: number;
};
