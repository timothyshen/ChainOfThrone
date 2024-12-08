import { useEffect, useState } from "react";
import { useWatchContractEvent, usePublicClient } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";
import {
  getGameStatus,
  get2DGrid,
  getRoundSubmitted,
  getRoundNumber,
  idToAddress,
} from "@/lib/hooks/ReadGameContract";
import { toast } from "@/lib/hooks/use-toast";

enum GameStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
}

interface GameState {
  status: GameStatus;
  grid: number[][];
  roundSubmitted: boolean[];
  currentRound: number;
  players: `0x${string}`[];
}

type ContractEventConfig = {
  title: string;
  description: string | ((args: any) => string);
};

export const useGameStateUpdates = (gameAddress?: `0x${string}`) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventHandlers: Record<string, ContractEventConfig> = {
    GameStarted: {
      title: "Game Started",
      description: "The game has begun!",
    },
    GameFinalized: {
      title: "Game Finished",
      description: (winner) => `Winner: ${winner}`,
    },
    PlayerAdded: {
      title: "Player Added",
      description: "A new player has joined the game",
    },
    RoundCompleted: {
      title: "Round Completed",
      description: (logs) =>
        `Round ${logs[0]?.args?.roundNumber || "unknown"} has been completed`,
    },
  };

  const setupContractEvent = (eventName: keyof typeof eventHandlers) => {
    useWatchContractEvent({
      address: gameAddress,
      abi: gameAbi,
      eventName,
      onLogs(logs) {
        fetchGameState(gameAddress);
        const handler = eventHandlers[eventName];
        if (handler) {
          toast({
            title: handler.title,
            description:
              typeof handler.description === "function"
                ? handler.description(logs)
                : handler.description,
          });
        }
      },
    });
  };

  const fetchGameState = async (gameAddress?: `0x${string}`) => {
    if (!gameAddress) return;
    setError(null);

    try {
      setIsLoading(true);
      const [status, grid, roundSubmitted, currentRound] = await Promise.all([
        getGameStatus(gameAddress),
        get2DGrid(gameAddress),
        getRoundSubmitted(gameAddress, 0),
        getRoundNumber(gameAddress),
      ]);
      const players = await Promise.all([
        idToAddress(gameAddress, 0),
        idToAddress(gameAddress, 1),
      ]);

      setGameState({
        status: Number(status),
        grid: grid as number[][],
        roundSubmitted: [roundSubmitted as boolean],
        currentRound: Number(currentRound),
        players: players as `0x${string}`[],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch game state";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup all event listeners
  Object.keys(eventHandlers).forEach((eventName) => {
    setupContractEvent(eventName as keyof typeof eventHandlers);
  });

  // Initial fetch and setup
  useEffect(() => {
    if (gameAddress) {
      fetchGameState();
    }
  }, [gameAddress]);

  return {
    gameState,
    gameStatusLoading: isLoading,
    error,
    refreshGameState: () => fetchGameState(gameAddress),
  };
};
