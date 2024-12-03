import { useEffect, useState } from "react";
import { useWatchContractEvent, usePublicClient } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";
import {
  getGameStatus,
  get2DGrid,
  getRoundSubmitted,
} from "@/lib/hooks/ReadGameContract";
import { toast } from "@/lib/hooks/use-toast";

interface GameState {
  status: number;
  grid: any[][];
  roundSubmitted: boolean[];
}

export const useGameStateUpdates = (gameAddress?: `0x${string}`) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  const fetchGameState = async (gameAddress?: `0x${string}`) => {
    if (!gameAddress) return;

    try {
      setIsLoading(true);
      const [status, grid, roundSubmitted] = await Promise.all([
        getGameStatus(gameAddress),
        get2DGrid(gameAddress),
        getRoundSubmitted(gameAddress, 0), // You might need to fetch for all players
      ]);

      setGameState({
        status: Number(status),
        grid: grid as any[][],
        roundSubmitted: [roundSubmitted as boolean],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch game state",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to GameStarted event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameStarted",
    onLogs() {
      fetchGameState();
      toast({
        title: "Game Started",
        description: "The game has begun!",
      });
    },
  });

  // Listen to GameFinalized event
  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameFinalized",
    onLogs(winner) {
      fetchGameState();
      toast({
        title: "Game Finished",
        description: `Winner: ${winner}`,
      });
    },
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
    refreshGameState: fetchGameState,
  };
};
