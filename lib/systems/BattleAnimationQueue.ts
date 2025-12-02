import { BattleState } from "@/lib/types/advancedGame";
import { Army, Territory } from "@/lib/types/game";
import { logger } from "@/lib/utils/logger";

/**
 * Battle Animation Queue
 *
 * Manages sequential execution of battle animations to prevent overlaps
 * Ensures battles play one after another for clear visual feedback
 */

export interface QueuedBattle {
  id: string;
  attacker: Army;
  target: Army | Territory;
  priority: number; // Higher priority = plays first
  timestamp: number;
}

export interface BattleAnimationQueueOptions {
  onBattleStart: (battle: QueuedBattle) => void;
  onBattleComplete: (battleId: string) => void;
  onQueueEmpty: () => void;
}

export class BattleAnimationQueue {
  private queue: QueuedBattle[] = [];
  private isPlaying: boolean = false;
  private currentBattleId: string | null = null;
  private callbacks: BattleAnimationQueueOptions | null = null;

  /**
   * Set callbacks for queue events
   */
  setCallbacks(callbacks: BattleAnimationQueueOptions): void {
    this.callbacks = callbacks;
  }

  /**
   * Add a battle to the queue
   */
  enqueue(battle: Omit<QueuedBattle, "id" | "timestamp">): string {
    const id = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedBattle: QueuedBattle = {
      ...battle,
      id,
      timestamp: Date.now(),
    };

    // Insert in priority order (higher priority first)
    const insertIndex = this.queue.findIndex((b) => b.priority < battle.priority);
    if (insertIndex === -1) {
      this.queue.push(queuedBattle);
    } else {
      this.queue.splice(insertIndex, 0, queuedBattle);
    }

    logger.debug(`Battle queued: ${id}, queue length: ${this.queue.length}`);

    // Start processing if not already playing
    if (!this.isPlaying) {
      this.processNext();
    }

    return id;
  }

  /**
   * Add multiple battles at once
   */
  enqueueBatch(battles: Omit<QueuedBattle, "id" | "timestamp">[]): string[] {
    return battles.map((battle) => this.enqueue(battle));
  }

  /**
   * Process the next battle in the queue
   */
  private processNext(): void {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentBattleId = null;
      logger.debug("Battle queue empty");
      this.callbacks?.onQueueEmpty();
      return;
    }

    this.isPlaying = true;
    const battle = this.queue.shift()!;
    this.currentBattleId = battle.id;

    logger.debug(`Processing battle: ${battle.id}`);
    this.callbacks?.onBattleStart(battle);
  }

  /**
   * Mark current battle as complete and process next
   */
  markComplete(battleId: string): void {
    if (battleId !== this.currentBattleId) {
      logger.warn(`Unexpected battle completion: ${battleId}, expected: ${this.currentBattleId}`);
      return;
    }

    logger.debug(`Battle complete: ${battleId}`);
    this.callbacks?.onBattleComplete(battleId);
    this.currentBattleId = null;
    this.processNext();
  }

  /**
   * Cancel a specific battle (removes from queue if not yet playing)
   */
  cancel(battleId: string): boolean {
    const index = this.queue.findIndex((b) => b.id === battleId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      logger.debug(`Battle cancelled: ${battleId}`);
      return true;
    }
    return false;
  }

  /**
   * Clear all pending battles
   */
  clearQueue(): void {
    const cleared = this.queue.length;
    this.queue = [];
    logger.debug(`Queue cleared: ${cleared} battles removed`);
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    isPlaying: boolean;
    currentBattleId: string | null;
    queueLength: number;
    pendingBattles: QueuedBattle[];
  } {
    return {
      isPlaying: this.isPlaying,
      currentBattleId: this.currentBattleId,
      queueLength: this.queue.length,
      pendingBattles: [...this.queue],
    };
  }

  /**
   * Check if a specific battle is in the queue or playing
   */
  hasBattle(battleId: string): boolean {
    return (
      this.currentBattleId === battleId ||
      this.queue.some((b) => b.id === battleId)
    );
  }

  /**
   * Get queue length including current battle
   */
  get length(): number {
    return this.queue.length + (this.isPlaying ? 1 : 0);
  }

  /**
   * Check if queue is currently processing
   */
  get isProcessing(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance for global use
let queueInstance: BattleAnimationQueue | null = null;

export function getBattleAnimationQueue(): BattleAnimationQueue {
  if (!queueInstance) {
    queueInstance = new BattleAnimationQueue();
  }
  return queueInstance;
}

export function resetBattleAnimationQueue(): void {
  queueInstance = null;
}
