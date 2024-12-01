export type Territory = {
  id: string;
  name: string;
  x: number;
  y: number;
  player: `0x${string}`;
  units: bigint[];
  isCastle: boolean;
};

export type Move = {
  player: `0x${string}`;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  units: number;
};

export type Unit = {
  id: string;
  type: "army";
  player: `0x${string}`;
  position: string;
  strength: number;
};

export type Player = {
  id: `0x${string}`;
  name: string;
  color: string;
  isReady: boolean;
  supplyCenters: number;
};

export const initialUnits: Unit[] = [
  {
    id: "unit1",
    type: "army",
    player: "0x0000000000000000000000000000000000000000",
    position: "territory1",
    strength: 10,
  },
  {
    id: "unit2",
    type: "army",
    player: "0x0000000000000000000000000000000000000000",
    position: "territory9",
    strength: 10,
  },
];

export const InitialPlayers: Player[] = [
  {
    id: "0x0000000000000000000000000000000000000000",
    name: "Player 1",
    color: "#FF0000",
    isReady: false,
    supplyCenters: 0,
  },
  {
    id: "0x0000000000000000000000000000000000000000",
    name: "Player 2",
    color: "#0000FF",
    isReady: false,
    supplyCenters: 0,
  },
];

export const AvailableCountries = [
  { name: "England", color: "#FF0000" },
  { name: "France", color: "#0000FF" },
  { name: "Germany", color: "#000000" },
];
