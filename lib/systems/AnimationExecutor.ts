import { AnimationSequence, AnimationTask } from './AnimationSequencer'
import { Army } from '@/lib/types/game'
import { ANIMATION_DURATIONS } from '@/lib/constants/animations'

/**
 * AnimationExecutor
 *
 * Executes animation sequences by coordinating with existing animation systems
 * Manages timing, parallel/sequential execution, and state updates
 */

export type AnimationCallbacks = {
  // Movement animations
  onMoveStart: (armyId: string, from: { x: number; y: number }, to: { x: number; y: number }) => void
  onMoveComplete: (armyId: string) => void

  // Battle animations
  onBattleStart: (location: { x: number; y: number }, intensity: string) => void
  onBattleComplete: (location: { x: number; y: number }) => void

  // Territory capture animations
  onCaptureStart: (territory: any, newOwner: string) => void
  onCaptureComplete: (territory: any) => void

  // Army spawn/destroy
  onArmySpawn: (army: Army) => void
  onArmyDestroy: (army: Army) => void
}

export class AnimationExecutor {
  private isPlaying: boolean = false
  private currentSequence: AnimationSequence | null = null
  private callbacks: AnimationCallbacks | null = null

  /**
   * Set animation callbacks
   */
  setCallbacks(callbacks: AnimationCallbacks): void {
    this.callbacks = callbacks
  }

  /**
   * Check if executor is currently playing animations
   */
  isAnimating(): boolean {
    return this.isPlaying
  }

  /**
   * Play animation sequence
   * Returns promise that resolves when all animations complete
   */
  async playSequence(sequence: AnimationSequence): Promise<void> {
    if (this.isPlaying) {
      console.warn('⚠️ Animation already in progress, skipping new sequence')
      return
    }

    if (!this.callbacks) {
      console.error('❌ No callbacks set for AnimationExecutor')
      return
    }

    this.isPlaying = true
    this.currentSequence = sequence

    console.log(
      `▶️ Starting animation sequence for round ${sequence.roundNumber} - ${sequence.totalDuration}ms total`
    )

    try {
      // Execute animations in phases (sequential)
      // Phase 1: Movement (parallel within phase)
      if (sequence.phases.movement.length > 0) {
        console.log(`🚶 Phase 1: Movement (${sequence.phases.movement.length} tasks)`)
        await this.executePhase(sequence.phases.movement)
      }

      // Phase 2: Combat (parallel within phase)
      if (sequence.phases.combat.length > 0) {
        console.log(`⚔️ Phase 2: Combat (${sequence.phases.combat.length} tasks)`)
        await this.executePhase(sequence.phases.combat)
      }

      // Phase 3: Capture (sequential)
      if (sequence.phases.capture.length > 0) {
        console.log(`🏴 Phase 3: Territory Capture (${sequence.phases.capture.length} tasks)`)
        await this.executePhaseSer sequential(sequence.phases.capture)
      }

      console.log(`✅ Animation sequence completed for round ${sequence.roundNumber}`)
    } catch (error) {
      console.error('❌ Error during animation execution:', error)
    } finally {
      this.isPlaying = false
      this.currentSequence = null
    }
  }

  /**
   * Execute phase tasks in parallel
   */
  private async executePhase(tasks: AnimationTask[]): Promise<void> {
    const promises = tasks.map((task) => this.executeTask(task))
    await Promise.all(promises)
  }

  /**
   * Execute phase tasks sequentially
   */
  private async executePhaseSequential(tasks: AnimationTask[]): Promise<void> {
    for (const task of tasks) {
      await this.executeTask(task)
    }
  }

  /**
   * Execute individual animation task
   */
  private async executeTask(task: AnimationTask): Promise<void> {
    if (!this.callbacks) return

    console.log(`  ▸ Executing ${task.type} animation: ${task.id}`)

    switch (task.type) {
      case 'move':
        await this.executeMove(task)
        break

      case 'battle':
        await this.executeBattle(task)
        break

      case 'capture':
        await this.executeCapture(task)
        break

      case 'spawn':
        await this.executeSpawn(task)
        break

      case 'destroy':
        await this.executeDestroy(task)
        break

      default:
        console.warn(`Unknown animation type: ${task.type}`)
    }
  }

  /**
   * Execute movement animation
   */
  private async executeMove(task: AnimationTask): Promise<void> {
    const { army, from, to } = task.data

    this.callbacks!.onMoveStart(army.id, from, to)

    // Wait for animation duration
    await this.sleep(task.duration)

    this.callbacks!.onMoveComplete(army.id)
  }

  /**
   * Execute battle animation
   */
  private async executeBattle(task: AnimationTask): Promise<void> {
    const { location, intensity } = task.data

    this.callbacks!.onBattleStart(location, intensity)

    // Wait for battle animation duration
    await this.sleep(task.duration)

    this.callbacks!.onBattleComplete(location)
  }

  /**
   * Execute territory capture animation
   */
  private async executeCapture(task: AnimationTask): Promise<void> {
    const { territory, newOwner } = task.data

    this.callbacks!.onCaptureStart(territory, newOwner)

    // Wait for capture animation duration
    await this.sleep(task.duration)

    this.callbacks!.onCaptureComplete(territory)
  }

  /**
   * Execute army spawn animation
   */
  private async executeSpawn(task: AnimationTask): Promise<void> {
    const { army } = task.data

    this.callbacks!.onArmySpawn(army)

    // Wait for spawn animation
    await this.sleep(task.duration)
  }

  /**
   * Execute army destroy animation
   */
  private async executeDestroy(task: AnimationTask): Promise<void> {
    const { army } = task.data

    this.callbacks!.onArmyDestroy(army)

    // Wait for destruction animation
    await this.sleep(task.duration)
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Stop current animation sequence
   */
  stop(): void {
    if (this.isPlaying) {
      console.log('⏹️ Stopping animation sequence')
      this.isPlaying = false
      this.currentSequence = null
    }
  }

  /**
   * Get current sequence info
   */
  getCurrentSequence(): AnimationSequence | null {
    return this.currentSequence
  }
}
