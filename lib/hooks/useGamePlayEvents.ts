"use client";

import { useRef, useCallback } from "react";
import { useWatchContractEvent } from "wagmi";
import { useToast } from "@/lib/hooks/use-toast";
import { gameAbi } from "@/lib/contract/gameAbi";
import { getRoundNumber } from "@/lib/hooks/ReadGameContract";
import { logger } from "@/lib/utils/logger";

interface UseGamePlayEventsOptions {
  gameAddress: `0x${string}`;
  isAnimating: boolean;
  refreshAllData: () => void;
  playRoundTransition: (roundNumber: number) => Promise<void>;
}

/**
 * Custom hook for handling game contract events in the GamePlayPage
 * Consolidates event listeners with rate limiting and animation integration
 */
export function useGamePlayEvents({
  gameAddress,
  isAnimating,
  refreshAllData,
  playRoundTransition,
}: UseGamePlayEventsOptions) {
  const { toast } = useToast();
  const lastRefreshRef = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 2000; // 2 seconds

  // Rate-limited refresh handler
  const handleEventRefresh = useCallback(() => {
    const now = Date.now();

    // Don't refresh if animation is playing
    if (isAnimating) {
      logger.debug("Skipping refresh - animation in progress");
      return;
    }

    if (now - lastRefreshRef.current > MIN_REFRESH_INTERVAL) {
      logger.debug("Event-triggered refresh allowed");
      lastRefreshRef.current = now;
      refreshAllData();
    } else {
      logger.debug("Event-triggered refresh rate limited");
    }
  }, [refreshAllData, isAnimating]);

  // Round completed event - with animation
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "RoundCompleted",
    onLogs: async () => {
      try {
        const newRoundNumber = await getRoundNumber(gameAddress);
        logger.log(
          `RoundCompleted event - transitioning to round ${newRoundNumber}`
        );

        await playRoundTransition(newRoundNumber as number);

        toast({
          title: "Round Completed",
          description: `Round ${newRoundNumber} has been completed`,
        });
      } catch (error) {
        logger.error("Error handling RoundCompleted event:", error);
        handleEventRefresh();
      }
    },
  });

  // Move submitted event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "MoveSubmitted",
    onLogs() {
      handleEventRefresh();
      toast({
        title: "Move Submitted",
        description: "A move has been submitted",
      });
    },
  });

  // Player added event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "PlayerAdded",
    onLogs() {
      handleEventRefresh();
    },
  });

  // Game started event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameStarted",
    onLogs() {
      handleEventRefresh();
      toast({
        title: "Game Started",
        description: "The game has begun!",
      });
    },
  });

  return { handleEventRefresh };
}
