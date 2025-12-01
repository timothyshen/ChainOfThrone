"use client";

import { useCallback, useRef } from "react";
import { useWatchContractEvent } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";
import { useToast } from "@/lib/hooks/use-toast";
import { logger } from "@/lib/utils/logger";

interface UseGameContractEventsOptions {
  gameAddress: `0x${string}` | undefined;
  onRefresh: () => void | Promise<void>;
  onRoundCompleted?: (roundNumber: number) => void | Promise<void>;
  onMoveSubmitted?: () => void;
  onPlayerAdded?: () => void;
  onGameStarted?: () => void;
  isAnimating?: boolean;
  showToasts?: boolean;
  minRefreshInterval?: number;
}

interface UseGameContractEventsReturn {
  lastRefreshTime: number;
}

/**
 * Consolidated hook for all game contract event listeners
 * Handles rate limiting, animation blocking, and toast notifications
 */
export function useGameContractEvents({
  gameAddress,
  onRefresh,
  onRoundCompleted,
  onMoveSubmitted,
  onPlayerAdded,
  onGameStarted,
  isAnimating = false,
  showToasts = true,
  minRefreshInterval = 2000,
}: UseGameContractEventsOptions): UseGameContractEventsReturn {
  const { toast } = useToast();
  const lastRefreshRef = useRef<number>(0);

  const handleRefresh = useCallback(() => {
    const now = Date.now();

    if (isAnimating) {
      logger.log("Skipping refresh - animation in progress");
      return;
    }

    if (now - lastRefreshRef.current > minRefreshInterval) {
      logger.log("Event-triggered refresh allowed");
      lastRefreshRef.current = now;
      onRefresh();
    } else {
      logger.log("Event-triggered refresh rate limited");
    }
  }, [onRefresh, isAnimating, minRefreshInterval]);

  // Round completed event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "RoundCompleted",
    onLogs: async (logs) => {
      try {
        logger.log("RoundCompleted event received", logs);

        if (onRoundCompleted) {
          // Extract round number from event if available
          const roundNumber = logs[0]?.args
            ? (logs[0].args as { roundNumber?: bigint }).roundNumber
            : undefined;
          await onRoundCompleted(roundNumber ? Number(roundNumber) : 0);
        } else {
          handleRefresh();
        }

        if (showToasts) {
          toast({
            title: "Round Completed",
            description: "A round has been completed",
          });
        }
      } catch (error) {
        logger.error("Error handling RoundCompleted event:", error);
        handleRefresh();
      }
    },
  });

  // Move submitted event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "MoveSubmitted",
    onLogs: () => {
      handleRefresh();
      onMoveSubmitted?.();

      if (showToasts) {
        toast({
          title: "Move Submitted",
          description: "A move has been submitted",
        });
      }
    },
  });

  // Player added event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "PlayerAdded",
    onLogs: () => {
      handleRefresh();
      onPlayerAdded?.();
    },
  });

  // Game started event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameStarted",
    onLogs: () => {
      handleRefresh();
      onGameStarted?.();

      if (showToasts) {
        toast({
          title: "Game Started",
          description: "The game has begun!",
        });
      }
    },
  });

  return {
    lastRefreshTime: lastRefreshRef.current,
  };
}
