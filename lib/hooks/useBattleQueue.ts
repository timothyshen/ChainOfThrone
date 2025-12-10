"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import {
  BattleAnimationQueue,
  QueuedBattle,
} from "@/lib/systems/BattleAnimationQueue";
import { Army, Territory } from "@/lib/types/game";
import { useBattleContext, useMovementContext } from "@/lib/contexts/GameContext";
import { logger } from "@/lib/utils/logger";

/**
 * useBattleQueue Hook
 *
 * Provides a React-friendly interface to the battle animation queue
 * Ensures battles play sequentially without overlapping
 */

export interface UseBattleQueueReturn {
  /** Add a battle to the queue */
  queueBattle: (
    attacker: Army,
    target: Army | Territory,
    priority?: number
  ) => string;

  /** Add multiple battles at once */
  queueBattles: (
    battles: { attacker: Army; target: Army | Territory; priority?: number }[]
  ) => string[];

  /** Cancel a pending battle */
  cancelBattle: (battleId: string) => boolean;

  /** Clear all pending battles */
  clearQueue: () => void;

  /** Current queue length */
  queueLength: number;

  /** Is a battle currently playing */
  isPlaying: boolean;

  /** Current battle ID if playing */
  currentBattleId: string | null;
}

export function useBattleQueue(): UseBattleQueueReturn {
  const queue = useRef(new BattleAnimationQueue()).current;
  const { startBattle, activeBattle } = useBattleContext();
  const { getArmyDisplayPosition } = useMovementContext();

  // Track queue state for React
  const [queueLength, setQueueLength] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBattleId, setCurrentBattleId] = useState<string | null>(null);

  // Setup queue callbacks
  useEffect(() => {
    queue.setCallbacks({
      onBattleStart: (queuedBattle: QueuedBattle) => {
        logger.debug(`Queue starting battle: ${queuedBattle.id}`);
        setCurrentBattleId(queuedBattle.id);
        setIsPlaying(true);
        updateQueueLength();

        // Trigger the actual battle animation via context
        startBattle(
          queuedBattle.attacker,
          queuedBattle.target,
          getArmyDisplayPosition
        );
      },
      onBattleComplete: (battleId: string) => {
        logger.debug(`Queue battle complete: ${battleId}`);
        setCurrentBattleId(null);
        updateQueueLength();
      },
      onQueueEmpty: () => {
        logger.debug("Battle queue empty");
        setIsPlaying(false);
        setCurrentBattleId(null);
        setQueueLength(0);
      },
    });
    // Note: queue is a stable ref, updateQueueLength is defined later but stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBattle, getArmyDisplayPosition]);

  // Watch for battle completion to advance queue
  useEffect(() => {
    // When activeBattle becomes null (battle ended), mark as complete
    if (activeBattle === null && currentBattleId) {
      queue.markComplete(currentBattleId);
    }
  }, [activeBattle, currentBattleId, queue]);

  const updateQueueLength = useCallback(() => {
    setQueueLength(queue.length);
  }, [queue]);

  /**
   * Queue a single battle
   */
  const queueBattle = useCallback(
    (attacker: Army, target: Army | Territory, priority: number = 0): string => {
      const battleId = queue.enqueue({ attacker, target, priority });
      updateQueueLength();
      return battleId;
    },
    [queue, updateQueueLength]
  );

  /**
   * Queue multiple battles at once
   */
  const queueBattles = useCallback(
    (
      battles: { attacker: Army; target: Army | Territory; priority?: number }[]
    ): string[] => {
      const ids = queue.enqueueBatch(
        battles.map((b) => ({
          attacker: b.attacker,
          target: b.target,
          priority: b.priority ?? 0,
        }))
      );
      updateQueueLength();
      return ids;
    },
    [queue, updateQueueLength]
  );

  /**
   * Cancel a pending battle
   */
  const cancelBattle = useCallback(
    (battleId: string): boolean => {
      const result = queue.cancel(battleId);
      updateQueueLength();
      return result;
    },
    [queue, updateQueueLength]
  );

  /**
   * Clear all pending battles
   */
  const clearQueue = useCallback(() => {
    queue.clearQueue();
    setQueueLength(0);
  }, [queue]);

  return {
    queueBattle,
    queueBattles,
    cancelBattle,
    clearQueue,
    queueLength,
    isPlaying,
    currentBattleId,
  };
}
