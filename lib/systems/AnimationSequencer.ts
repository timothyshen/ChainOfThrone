import { ANIMATION_DURATIONS } from '@/lib/constants/animations'
import { StateDiff, ArmyChange, TerritoryChange } from './StateManager'
import { Army, Territory } from '@/lib/types/game'

/**
 * AnimationSequencer
 *
 * Converts state differences into executable animation tasks
 * Organizes animations by type and execution order
 */

export interface AnimationTask {
  id: string
  type: 'move' | 'battle' | 'capture' | 'spawn' | 'destroy'
  priority: number // Lower number = higher priority
  duration: number
  data: any
}

export interface AnimationSequence {
  roundNumber: number
  tasks: AnimationTask[]
  totalDuration: number
  phases: {
    movement: AnimationTask[]
    combat: AnimationTask[]
    capture: AnimationTask[]
  }
}

export class AnimationSequencer {
  /**
   * Generate animation sequence from state diff
   */
  generateSequence(diff: StateDiff): AnimationSequence {
    const tasks: AnimationTask[] = []

    console.log(
      `🎬 Generating animation sequence for round ${diff.roundNumber}`
    )

    // Phase 1: Movement animations (priority 1)
    const movementTasks = this.generateMovementAnimations(diff.armyChanges)
    tasks.push(...movementTasks)

    // Phase 2: Combat animations (priority 2)
    const combatTasks = this.generateCombatAnimations(diff.armyChanges)
    tasks.push(...combatTasks)

    // Phase 3: Territory capture animations (priority 3)
    const captureTasks = this.generateCaptureAnimations(diff.territoryChanges)
    tasks.push(...captureTasks)

    // Calculate total duration
    const totalDuration = this.calculateTotalDuration(tasks)

    const sequence: AnimationSequence = {
      roundNumber: diff.roundNumber,
      tasks,
      totalDuration,
      phases: {
        movement: movementTasks,
        combat: combatTasks,
        capture: captureTasks,
      },
    }

    console.log(
      `✨ Generated ${tasks.length} animations (${movementTasks.length} moves, ${combatTasks.length} battles, ${captureTasks.length} captures) - Total: ${totalDuration}ms`
    )

    return sequence
  }

  /**
   * Generate movement animations from army changes
   */
  private generateMovementAnimations(armyChanges: ArmyChange[]): AnimationTask[] {
    const tasks: AnimationTask[] = []

    armyChanges
      .filter((change) => change.type === 'moved')
      .forEach((change, index) => {
        tasks.push({
          id: `move-${change.army.id}-${index}`,
          type: 'move',
          priority: 1,
          duration: ANIMATION_DURATIONS.ARMY_MOVE,
          data: {
            army: change.army,
            from: change.from!,
            to: change.to!,
          },
        })
      })

    // Also handle newly spawned armies
    armyChanges
      .filter((change) => change.type === 'created')
      .forEach((change, index) => {
        tasks.push({
          id: `spawn-${change.army.id}-${index}`,
          type: 'spawn',
          priority: 1,
          duration: 800,
          data: {
            army: change.army,
          },
        })
      })

    return tasks
  }

  /**
   * Generate combat animations from army changes
   */
  private generateCombatAnimations(armyChanges: ArmyChange[]): AnimationTask[] {
    const tasks: AnimationTask[] = []

    // Group combat events by location to create combined battle animations
    const combatLocations = new Map<string, ArmyChange[]>()

    // Collect size changes and destructions
    armyChanges
      .filter(
        (change) => change.type === 'sizeChanged' || change.type === 'destroyed'
      )
      .forEach((change) => {
        const locationKey = `${change.army.x},${change.army.y}`
        if (!combatLocations.has(locationKey)) {
          combatLocations.set(locationKey, [])
        }
        combatLocations.get(locationKey)!.push(change)
      })

    // Create battle animation for each location with combat
    Array.from(combatLocations.entries()).forEach(([locationKey, changes], index) => {
      const [x, y] = locationKey.split(',').map(Number)

      // Determine battle intensity based on number of armies involved
      const armiesInvolved = changes.length
      const destroyed = changes.filter((c) => c.type === 'destroyed')

      tasks.push({
        id: `battle-${locationKey}-${index}`,
        type: 'battle',
        priority: 2,
        duration: ANIMATION_DURATIONS.BATTLE_PROGRESS,
        data: {
          location: { x, y },
          changes,
          armiesInvolved,
          hasDeaths: destroyed.length > 0,
          intensity: this.calculateBattleIntensity(changes),
        },
      })

      // Add individual army destruction animations
      destroyed.forEach((change, destroyIndex) => {
        tasks.push({
          id: `destroy-${change.army.id}-${destroyIndex}`,
          type: 'destroy',
          priority: 2,
          duration: 1200,
          data: {
            army: change.army,
            location: { x: change.army.x, y: change.army.y },
          },
        })
      })
    })

    return tasks
  }

  /**
   * Generate territory capture animations
   */
  private generateCaptureAnimations(
    territoryChanges: TerritoryChange[]
  ): AnimationTask[] {
    const tasks: AnimationTask[] = []

    territoryChanges.forEach((change, index) => {
      // Special animation for castle captures
      const isCastle = change.territory.isCastle
      const duration = isCastle ? 2000 : 1000

      tasks.push({
        id: `capture-${change.territory.x}-${change.territory.y}-${index}`,
        type: 'capture',
        priority: 3,
        duration,
        data: {
          territory: change.territory,
          oldOwner: change.oldOwner,
          newOwner: change.newOwner,
          isCastle,
        },
      })
    })

    return tasks
  }

  /**
   * Calculate battle intensity based on changes
   */
  private calculateBattleIntensity(changes: ArmyChange[]): 'low' | 'medium' | 'high' {
    const totalDamage = changes.reduce((sum, change) => {
      if (change.type === 'destroyed') return sum + (change.army.size || 0)
      if (change.type === 'sizeChanged' && change.oldSize) {
        return sum + Math.abs(change.army.size - change.oldSize)
      }
      return sum
    }, 0)

    if (totalDamage > 50) return 'high'
    if (totalDamage > 20) return 'medium'
    return 'low'
  }

  /**
   * Calculate total duration for all tasks
   * Considers parallel and sequential execution
   */
  private calculateTotalDuration(tasks: AnimationTask[]): number {
    // Group by priority
    const phases = new Map<number, AnimationTask[]>()

    tasks.forEach((task) => {
      if (!phases.has(task.priority)) {
        phases.set(task.priority, [])
      }
      phases.get(task.priority)!.push(task)
    })

    // Sum max duration from each phase (parallel tasks within phase)
    let total = 0
    Array.from(phases.values()).forEach((phaseTasks) => {
      const maxDuration = Math.max(...phaseTasks.map((t) => t.duration), 0)
      total += maxDuration
    })

    return total
  }

  /**
   * Filter tasks by type
   */
  getTasksByType(
    sequence: AnimationSequence,
    type: AnimationTask['type']
  ): AnimationTask[] {
    return sequence.tasks.filter((task) => task.type === type)
  }

  /**
   * Get tasks sorted by priority
   */
  getSortedTasks(sequence: AnimationSequence): AnimationTask[] {
    return [...sequence.tasks].sort((a, b) => a.priority - b.priority)
  }
}
