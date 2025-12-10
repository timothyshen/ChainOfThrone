import { Army, Territory } from "@/lib/types/game";

export interface BattleState {
  id: string;
  attackerArmy: Army;
  defenderArmy?: Army;
  defenderTerritory?: Territory;
  isActive: boolean;
  progress: number;
  attackerDamage: number;
  defenderDamage: number;
  winner: "attacker" | "defender" | null;
  phase: "preview" | "combat" | "results";
}

export interface BattleEffect {
  id: string;
  type: "clash" | "explosion" | "damage" | "victory";
  x: number;
  y: number;
  timestamp: number;
}

export interface SiegeState extends BattleState {
  siegePhase:
    | "approach"
    | "setup"
    | "bombardment"
    | "assault"
    | "breach"
    | "capture";
  wallIntegrity: number;
  siegeEquipment: string[];
  defenseBonus: number;
  siegeDuration: number;
}

export interface SiegeEffect {
  id: string;
  type:
    | "catapult"
    | "battering_ram"
    | "wall_damage"
    | "fire"
    | "breach"
    | "victory"
    | "clash"
    | "explosion"
    | "damage";
  x: number;
  y: number;
  timestamp: number;
  projectile?: boolean;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export interface TerritoryState extends Territory {
  isSelected: boolean;
}

// Aliases for existing components that expect these names
export type Battle = BattleState;

// Panel types
export type ActivePanel = "territory" | "army" | "overview" | null;

// Army position tracking for animations
export interface ArmyPosition {
  x: number;
  y: number;
  isAnimating: boolean;
}

// Battle target for preview
export interface BattleTarget {
  army?: Army;
  territory?: Territory;
}
