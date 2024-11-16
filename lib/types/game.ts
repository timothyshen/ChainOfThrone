export type TerritoryType = "supply" | "land";

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
  type: "move" | "split";
  unitId: string;
  from: string;
  to: string;
  splitStrength?: number;
};

export type Player = {
  id: string;
  name: string;
  isReady: boolean;
  supplyCenters: number;
};

export const territories: Territory[] = [
  { id: "territory1", name: "Supply", x: 0, y: 0, type: "supply" },
  { id: "territory2", name: "Land", x: 1, y: 0, type: "land" },
  { id: "territory3", name: "Supply", x: 2, y: 0, type: "supply" },
  { id: "territory4", name: "Land", x: 0, y: 1, type: "land" },
  { id: "territory5", name: "Supply", x: 1, y: 1, type: "supply" },
  { id: "territory6", name: "Land", x: 2, y: 1, type: "land" },
  { id: "territory7", name: "Supply", x: 0, y: 2, type: "supply" },
  { id: "territory8", name: "Land", x: 1, y: 2, type: "land" },
  { id: "territory9", name: "Supply", x: 2, y: 2, type: "supply" },
];

export const initialUnits: Unit[] = [
  {
    id: "unit1",
    type: "army",
    countryId: "player1",
    position: "territory2",
    strength: 10,
  },
  {
    id: "unit2",
    type: "army",
    countryId: "player2",
    position: "territory8",
    strength: 10,
  },
];

export const initialPlayers: Player[] = [
  { id: "player1", name: "Player 1", isReady: false, supplyCenters: 0 },
  { id: "player2", name: "Player 2", isReady: false, supplyCenters: 0 },
];
