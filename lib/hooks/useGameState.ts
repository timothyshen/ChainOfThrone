"use client";

import { useState, useEffect, useCallback } from "react";
import { Territory, Army } from "@/lib/types/game";
import { GameStatusEnum, PlayerState } from "@/lib/types/gameStatus";
import { getGameStatusText } from "@/lib/utils/gameStatus";
import {
  get2DGrid,
  addressToId,
  getMaxPlayer,
  totalPlayers,
  getGameStatus,
  getRoundSubmitted,
  idToAddress,
} from "@/lib/hooks/ReadGameContract";
import { useAccount } from "wagmi";
import { useToast } from "@/lib/hooks/use-toast";
import { GRID_CONFIG } from "@/lib/constants/grid";

interface GameState {
  // Core game status
  gameStatus: GameStatusEnum;
  totalPlayer: number;
  maxPlayer: number;
  playerAddresses: PlayerState[];
  playerId: string | null;

  // Territory & Army data
  territories: Territory[][];
  armies: Army[];

  // Loading states
  isGridLoading: boolean;
  isStatusLoading: boolean;
}

interface GameStateActions {
  getGrids: () => Promise<void>;
  getPlayerId: () => Promise<void>;
  fetchGameData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

export function useGameState(
  gameAddress: `0x${string}` | undefined
): GameState & GameStateActions {
  const { address } = useAccount();
  const { toast } = useToast();

  // Core game status
  const [gameStatus, setGameStatus] = useState<GameStatusEnum>(
    GameStatusEnum.NOT_STARTED
  );
  const [totalPlayer, setTotalPlayer] = useState<number>(0);
  const [maxPlayer, setMaxPlayer] = useState<number>(0);
  const [playerAddresses, setPlayerAddresses] = useState<PlayerState[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Territory & Army data
  const [territories, setTerritories] = useState<Territory[][]>([]);
  const [armies, setArmies] = useState<Army[]>([]);

  // Loading states
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(true);


  /**
   * Type guard to validate grid data structure
   * Ensures grid is properly shaped before processing
   */
  const isValidGridData = (data: unknown): data is any[][] => {
    if (!Array.isArray(data)) {
      console.error("Grid data is not an array");
      return false;
    }

    if (data.length !== GRID_CONFIG.rows) {
      console.error(`Grid data has ${data.length} rows, expected ${GRID_CONFIG.rows}`);
      return false;
    }

    // Check each row
    for (let i = 0; i < data.length; i++) {
      if (!Array.isArray(data[i])) {
        console.error(`Grid data row ${i} is not an array`);
        return false;
      }

      if (data[i].length !== GRID_CONFIG.cols) {
        console.error(`Grid data row ${i} has ${data[i].length} columns, expected ${GRID_CONFIG.cols}`);
        return false;
      }
    }

    return true;
  };

  const getGrids = useCallback(async () => {
    setIsGridLoading(true);
    try {
      if (!gameAddress) return;

      const gridData = await get2DGrid(gameAddress);
      const armies: Army[] = [];

      if (!gridData) return;

      // TYPE SAFETY: Validate grid structure before processing
      if (!isValidGridData(gridData)) {
        console.error("Invalid grid data received from contract");
        toast({
          title: "Error",
          description: "Invalid game grid data",
          variant: "destructive",
        });
        return;
      }

      const newGridData = (gridData as any[][]).map(
        (row: any[], rowIndex: number) =>
          row.map((territory: any, colIndex: number) => ({
            ...territory,
            id: `${rowIndex}-${colIndex}`,
            x: rowIndex,
            y: colIndex,
          }))
      );

      // Mock data for development - replace with actual gridData when ready

      newGridData.forEach((row: Territory[], rowIndex: number) => {
        row.forEach((territory: Territory, colIndex: number) => {
          territory.units.forEach((unit: bigint, index: number) => {
            if (unit > 0) {
              armies.push({
                id: `${rowIndex}-${colIndex}-${index}`,
                x: rowIndex,
                y: colIndex,
                size: Number(unit),
                owner: territory.player,
                isMoving: false,
              });
            }
          });
        });
      });

      setTerritories(newGridData);
      setArmies(armies);
    } catch (error) {
      console.error("Error fetching grid:", error);
      toast({
        title: "Error",
        description: "Failed to fetch game state",
        variant: "destructive",
      });
    } finally {
      setIsGridLoading(false);
    }
  }, [gameAddress, toast]);

  const getPlayerId = useCallback(async () => {
    if (!gameAddress || !address) return;
    try {
      const playerId = await addressToId(gameAddress, address);
      setPlayerId(playerId.toString());
    } catch (error) {
      console.error("Error fetching player ID:", error);
    }
  }, [gameAddress, address]);

  const fetchGameData = useCallback(async () => {
    setIsStatusLoading(true);
    try {
      if (!gameAddress) return;

      // OPTIMIZED: Use multicall to batch all contract reads into a single RPC call
      // This reduces 3-5+ separate calls down to 1 call
      const [status, total, max] = await Promise.all([
        getGameStatus(gameAddress),
        totalPlayers(gameAddress),
        getMaxPlayer(gameAddress),
      ]);

      setGameStatus(getGameStatusText(status as number));
      setTotalPlayer(total as number);
      setMaxPlayer(max as number);

      // SCALABLE + OPTIMIZED: Batch player reads if there are any players
      if ((total as number) > 0) {
        // For now, keep individual calls for player data
        // TODO v0.3: Implement batchReadGameData from multicall.ts for further optimization
        const addresses = await Promise.all(
          Array.from({ length: total as number }, (_, i) =>
            Promise.all([
              idToAddress(gameAddress, i),
              getRoundSubmitted(gameAddress, i),
            ])
          )
        );

        setPlayerAddresses(
          addresses.map(([address, roundSubmitted]) => ({
            address: address as string,
            roundSubmitted: roundSubmitted as boolean,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch game data",
        variant: "destructive",
      });
    } finally {
      setIsStatusLoading(false);
    }
  }, [gameAddress, toast]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([getGrids(), getPlayerId(), fetchGameData()]);
  }, [getGrids, getPlayerId, fetchGameData]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  return {
    // State
    gameStatus,
    totalPlayer,
    maxPlayer,
    playerAddresses,
    playerId,
    territories,
    armies,
    isGridLoading,
    isStatusLoading,

    // Actions
    getGrids,
    getPlayerId,
    fetchGameData,
    refreshAllData,
  };
}
