import { useEffect, useState } from "react";
import { useWatchContractEvent, usePublicClient } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";
import {
  getGameStatus,
  get2DGrid,
  getRoundSubmitted,
  getRoundNumber,
  idToAddress,
  totalPlayers,
  getMaxPlayer,
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
  players: { address: string; roundSubmitted: boolean }[];
  maxPlayers: number;
}

type ContractEventConfig = {
  title: string;
  description: string | ((args: any) => string);
};

export const useGameStateUpdates = (gameAddress?: `0x${string}`) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameStarted",
    onLogs() {
      fetchGameState(gameAddress);
      toast({
        title: "Game Started",
        description: "The game has begun!",
      });
    },
  });

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameFinalized",
    onLogs() {
      fetchGameState(gameAddress);
      toast({
        title: "Game Finished",
        description: `Winner`,
      });
    },
  });

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "PlayerAdded",
    onLogs() {
      fetchGameState(gameAddress);
      toast({
        title: "Player Added",
        description: "A new player has joined the game",
      });
    },
  });

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "MoveSubmitted",
    onLogs(logs) {
      console.log("MoveSubmitted", logs);
      fetchGameState(gameAddress);
      toast({
        title: "Move Submitted",
        description: "A move has been submitted",
      });
    },
  });

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "RoundCompleted",
    onLogs(logs) {
      console.log("RoundCompleted", logs);
      fetchGameState(gameAddress);
      toast({
        title: "Round Completed",
        description: `Round has been completed`,
      });
    },
  });

  const fetchGameState = async (gameAddress?: `0x${string}`) => {
    if (!gameAddress) return;
    setError(null);

    try {
      setIsLoading(true);
      const [
        status,
        grid,
        roundSubmitted,
        currentRound,
        totalPlayerCount,
        maxPlayer,
      ] = await Promise.all([
        getGameStatus(gameAddress),
        get2DGrid(gameAddress),
        getRoundSubmitted(gameAddress, 0),
        getRoundNumber(gameAddress),
        totalPlayers(gameAddress),
        getMaxPlayer(gameAddress),
      ]);

      let addresses;
      if ((totalPlayerCount as number) > 0) {
        addresses = await Promise.all(
          Array.from({ length: 2 }, (_, i) =>
            Promise.all([
              idToAddress(gameAddress, i),
              getRoundSubmitted(gameAddress, i),
            ])
          )
        );
      }

      setGameState({
        status: Number(status),
        grid: grid as number[][],
        roundSubmitted: [roundSubmitted as boolean],
        currentRound: Number(currentRound),
        players:
          addresses?.map(([address, roundSubmitted]) => ({
            address: address as string,
            roundSubmitted: roundSubmitted as boolean,
          })) ?? [],
        maxPlayers: maxPlayer as number,
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
