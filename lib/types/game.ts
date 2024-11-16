export type TerritoryType = "castle" | "land";

export type Territory = {
  id: string;
  name: string;
  x: number;
  y: number;
  type: TerritoryType;
};

export type Unit = {
  id: string;
  type: "army";
  countryId: string;
  position: string;
  strength: number;
};

export type Order = {
  type: "move";
  unitId: string;
  from: string;
  to: string;
  splitStrength?: number;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  country: string;
  isReady: boolean;
  supplyCenters: number;
};

export const territories: Territory[] = [
  { id: "territory1", name: "Castle 1", x: 0, y: 0, type: "castle" },
  { id: "territory2", name: "Land 1", x: 1, y: 0, type: "land" },
  { id: "territory3", name: "Castle 2", x: 2, y: 0, type: "castle" },
  { id: "territory4", name: "Land 2", x: 0, y: 1, type: "land" },
  { id: "territory5", name: "Castle 3", x: 1, y: 1, type: "castle" },
  { id: "territory6", name: "Land 3", x: 2, y: 1, type: "land" },
  { id: "territory7", name: "Castle 4", x: 0, y: 2, type: "castle" },
  { id: "territory8", name: "Land 4", x: 1, y: 2, type: "land" },
  { id: "territory9", name: "Castle 5", x: 2, y: 2, type: "castle" },
];

export const initialUnits: Unit[] = [
  {
    id: "unit1",
    type: "army",
    countryId: "player1",
    position: "territory1",
    strength: 10,
  },
  {
    id: "unit2",
    type: "army",
    countryId: "player2",
    position: "territory9",
    strength: 10,
  },
];

export const InitialTerritories: {
  [key: string]: { name: string; type: "land" | "sea"; supplyCenter: boolean };
} = {
  c1: { name: "Castle 1", type: "land", supplyCenter: true },
  c5: { name: "Castle 5", type: "land", supplyCenter: true },
};

export const InitialPlayers: Player[] = [
  {
    id: "player1",
    name: "Player 1",
    color: "#FF0000",
    country: "England",
    isReady: false,
    supplyCenters: 0,
  },
  {
    id: "player2",
    name: "Player 2",
    color: "#0000FF",
    country: "France",
    isReady: false,
    supplyCenters: 0,
  },
];

export const AvailableCountries = [
  { name: "England", color: "#FF0000" },
  { name: "France", color: "#0000FF" },
  { name: "Germany", color: "#000000" },
];
