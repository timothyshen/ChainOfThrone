import { Territory, Army } from '@/lib/types/game'

/**
 * StateManager
 *
 * Manages game state snapshots and calculates differences between states
 * Used to generate animation sequences for round transitions
 */

export interface GameStateSnapshot {
  roundNumber: number
  timestamp: number
  territories: Territory[][]
  armies: Army[]
}

export interface ArmyChange {
  type: 'moved' | 'destroyed' | 'created' | 'sizeChanged'
  army: Army
  from?: { x: number; y: number }
  to?: { x: number; y: number }
  oldSize?: number
}

export interface TerritoryChange {
  territory: Territory
  oldOwner: string
  newOwner: string
}

export interface StateDiff {
  roundNumber: number
  previousRound: number
  armyChanges: ArmyChange[]
  territoryChanges: TerritoryChange[]
  timestamp: number
}

export class StateManager {
  private previousState: GameStateSnapshot | null = null
  private currentState: GameStateSnapshot | null = null
  private stateHistory: GameStateSnapshot[] = []
  private maxHistorySize = 10 // Keep last 10 rounds

  /**
   * Capture current game state as a snapshot
   */
  captureSnapshot(
    territories: Territory[][],
    armies: Army[],
    roundNumber: number
  ): void {
    // Move current to previous
    if (this.currentState) {
      this.previousState = this.currentState

      // Add to history
      this.stateHistory.push(this.currentState)

      // Trim history if too large
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift()
      }
    }

    // Create new current state (deep clone to prevent mutations)
    this.currentState = {
      roundNumber,
      timestamp: Date.now(),
      territories: this.deepCloneTerritories(territories),
      armies: this.deepCloneArmies(armies),
    }

    console.log(
      `📸 Captured snapshot for round ${roundNumber} - ${armies.length} armies, ${this.flattenTerritories(territories).length} territories`
    )
  }

  /**
   * Calculate differences between previous and current state
   */
  calculateDiff(): StateDiff | null {
    if (!this.previousState || !this.currentState) {
      console.log('⚠️ Cannot calculate diff: missing previous or current state')
      return null
    }

    const diff: StateDiff = {
      roundNumber: this.currentState.roundNumber,
      previousRound: this.previousState.roundNumber,
      armyChanges: this.detectArmyChanges(),
      territoryChanges: this.detectTerritoryChanges(),
      timestamp: Date.now(),
    }

    console.log(
      `🔍 Calculated diff for round ${diff.roundNumber}: ${diff.armyChanges.length} army changes, ${diff.territoryChanges.length} territory changes`
    )

    return diff
  }

  /**
   * Detect changes in armies between states
   */
  private detectArmyChanges(): ArmyChange[] {
    if (!this.previousState || !this.currentState) return []

    const changes: ArmyChange[] = []
    const previousArmies = this.previousState.armies
    const currentArmies = this.currentState.armies

    // Track which current armies we've matched
    const matchedCurrentArmies = new Set<string>()

    // Check each previous army for changes or destruction
    previousArmies.forEach((oldArmy) => {
      // Try to find matching army (same owner and close position)
      const newArmy = currentArmies.find(
        (a) =>
          a.owner.toLowerCase() === oldArmy.owner.toLowerCase() &&
          !matchedCurrentArmies.has(a.id) &&
          (a.id === oldArmy.id ||
            this.armiesCouldBeRelated(oldArmy, a))
      )

      if (!newArmy) {
        // Army was destroyed
        changes.push({
          type: 'destroyed',
          army: oldArmy,
        })
        console.log(`💀 Army destroyed: ${oldArmy.id} at (${oldArmy.x}, ${oldArmy.y})`)
      } else {
        matchedCurrentArmies.add(newArmy.id)

        // Check for movement
        if (oldArmy.x !== newArmy.x || oldArmy.y !== newArmy.y) {
          changes.push({
            type: 'moved',
            army: newArmy,
            from: { x: oldArmy.x, y: oldArmy.y },
            to: { x: newArmy.x, y: newArmy.y },
          })
          console.log(
            `🚶 Army moved: ${newArmy.id} from (${oldArmy.x}, ${oldArmy.y}) to (${newArmy.x}, ${newArmy.y})`
          )
        }

        // Check for size change (battle damage)
        if (oldArmy.size !== newArmy.size) {
          changes.push({
            type: 'sizeChanged',
            army: newArmy,
            oldSize: oldArmy.size,
          })
          console.log(
            `⚔️ Army size changed: ${newArmy.id} from ${oldArmy.size} to ${newArmy.size}`
          )
        }
      }
    })

    // Check for newly created armies
    currentArmies.forEach((newArmy) => {
      if (!matchedCurrentArmies.has(newArmy.id)) {
        changes.push({
          type: 'created',
          army: newArmy,
        })
        console.log(`✨ Army created: ${newArmy.id} at (${newArmy.x}, ${newArmy.y})`)
      }
    })

    return changes
  }

  /**
   * Detect changes in territory ownership
   */
  private detectTerritoryChanges(): TerritoryChange[] {
    if (!this.previousState || !this.currentState) return []

    const changes: TerritoryChange[] = []

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const oldTerritory = this.previousState.territories[x]?.[y]
        const newTerritory = this.currentState.territories[x]?.[y]

        if (!oldTerritory || !newTerritory) continue

        if (
          oldTerritory.player.toLowerCase() !== newTerritory.player.toLowerCase()
        ) {
          changes.push({
            territory: newTerritory,
            oldOwner: oldTerritory.player,
            newOwner: newTerritory.player,
          })
          console.log(
            `🏴 Territory captured at (${x}, ${y}): ${this.truncateAddress(oldTerritory.player)} → ${this.truncateAddress(newTerritory.player)}`
          )
        }
      }
    }

    return changes
  }

  /**
   * Check if two armies could be the same army (for matching purposes)
   */
  private armiesCouldBeRelated(army1: Army, army2: Army): boolean {
    // Same owner and within 1 cell distance
    const distance = Math.abs(army1.x - army2.x) + Math.abs(army1.y - army2.y)
    return distance <= 1
  }

  /**
   * Get state at specific round from history
   */
  getHistoricalState(roundNumber: number): GameStateSnapshot | null {
    return (
      this.stateHistory.find((state) => state.roundNumber === roundNumber) ||
      null
    )
  }

  /**
   * Get all available historical rounds
   */
  getAvailableRounds(): number[] {
    return this.stateHistory.map((state) => state.roundNumber)
  }

  /**
   * Clear all state history
   */
  clearHistory(): void {
    this.previousState = null
    this.currentState = null
    this.stateHistory = []
    console.log('🗑️ State history cleared')
  }

  /**
   * Deep clone territories array
   */
  private deepCloneTerritories(territories: Territory[][]): Territory[][] {
    return territories.map((row) =>
      row.map((territory) => ({ ...territory }))
    )
  }

  /**
   * Deep clone armies array
   */
  private deepCloneArmies(armies: Army[]): Army[] {
    return armies.map((army) => ({ ...army }))
  }

  /**
   * Flatten 2D territories array
   */
  private flattenTerritories(territories: Territory[][]): Territory[] {
    return territories.flat()
  }

  /**
   * Truncate address for logging
   */
  private truncateAddress(address: string): string {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}
