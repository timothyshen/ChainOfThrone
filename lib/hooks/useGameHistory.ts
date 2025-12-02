import { useState, useEffect } from "react";
import { GameHistory, PlayerRank } from "@/lib/types/setup";
import {
  addGameHistory as dbAddGameHistory,
  getTopPlayers,
  getGameHistory,
} from "@/lib/services/db";
import { logger } from "@/lib/utils/logger";

export function useGameHistory() {
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [playerRanks, setPlayerRanks] = useState<PlayerRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get data from the database
      const [history, ranks] = await Promise.all([
        getGameHistory(),
        getTopPlayers(),
      ]);

      setGameHistory(history);
      setPlayerRanks(ranks);
    } catch (err) {
      logger.warn("Failed to load game history:", err);
      setError(err instanceof Error ? err.message : "Failed to load game data");
      // Return empty arrays instead of mock data
      setGameHistory([]);
      setPlayerRanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addGameHistory = async (newGame: GameHistory) => {
    try {
      await dbAddGameHistory(newGame);
      await loadData(); // Reload all data to ensure consistency
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add game history"
      );
      throw err;
    }
  };

  return {
    gameHistory,
    playerRanks,
    addGameHistory,
    isLoading,
    error,
  };
}
