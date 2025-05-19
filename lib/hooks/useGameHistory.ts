import { useState, useEffect } from "react";
import { GameHistory, PlayerRank } from "@/lib/types/setup";
import {
  addGameHistory as dbAddGameHistory,
  getTopPlayers,
  getGameHistory,
} from "@/lib/services/db";

// This would typically come from your backend or local storage
const MOCK_GAME_HISTORY: GameHistory[] = [
  {
    gameAddress: "0x123...",
    winner: "0xabc...",
    timestamp: Date.now() - 3600000,
    totalRounds: 5,
    players: ["0xabc...", "0xdef..."],
  },
  // Add more mock data as needed
];

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
      const [history, ranks] = await Promise.all([
        getGameHistory(),
        getTopPlayers(),
      ]);
      setGameHistory(history);
      // setPlayerRanks(ranks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game data");
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
