import { useEffect, useState, useMemo } from "react";
import { useWatchContractEvent, usePublicClient } from "wagmi";
import { watchContractEvent } from "wagmi/actions";
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
import { debounce } from "@/lib/utils/debounce";

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

  // Debounced fetch function to prevent multiple simultaneous refreshes
  // when multiple contract events fire at once
  const debouncedFetchGameState = useMemo(
    () => debounce((address?: `0x${string}`) => fetchGameState(address), 200),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: "GameStarted",
    onLogs() {
      debouncedFetchGameState(gameAddress);
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
      debouncedFetchGameState(gameAddress);
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
      debouncedFetchGameState(gameAddress);
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
      debouncedFetchGameState(gameAddress);
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
      debouncedFetchGameState(gameAddress);
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

      // SCALABLE: Use actual totalPlayers count instead of hardcoded value
      let addresses;
      if ((totalPlayerCount as number) > 0) {
        addresses = await Promise.all(
          Array.from({ length: totalPlayerCount as number }, (_, i) =>
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
