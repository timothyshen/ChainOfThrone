import { useState, useEffect } from "react";
import { GameHistory, PlayerRank } from "@/lib/types/setup";
import {
  addGameHistory as dbAddGameHistory,
  getTopPlayers,
  getGameHistory,
} from "@/lib/services/db";

// Mock data for development and testing
const MOCK_GAME_HISTORY: GameHistory[] = [
  {
    gameAddress: "0x1234567890123456789012345678901234567890",
    winner: "0xabc1234567890123456789012345678901234567",
    timestamp: Date.now() - 3600000, // 1 hour ago
    totalRounds: 5,
    players: [
      "0xabc1234567890123456789012345678901234567",
      "0xdef1234567890123456789012345678901234567",
      "0xaaa1234567890123456789012345678901234567",
    ],
  },
  {
    gameAddress: "0x2345678901234567890123456789012345678901",
    winner: "0xdef1234567890123456789012345678901234567",
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    totalRounds: 8,
    players: [
      "0xabc1234567890123456789012345678901234567",
      "0xdef1234567890123456789012345678901234567",
    ],
  },
  {
    gameAddress: "0x3456789012345678901234567890123456789012",
    winner: "0xabc1234567890123456789012345678901234567",
    timestamp: Date.now() - 86400000 * 5, // 5 days ago
    totalRounds: 3,
    players: [
      "0xabc1234567890123456789012345678901234567",
      "0xaaa1234567890123456789012345678901234567",
    ],
  },
  {
    gameAddress: "0x4567890123456789012345678901234567890123",
    winner: "0xaaa1234567890123456789012345678901234567",
    timestamp: Date.now() - 86400000 * 10, // 10 days ago
    totalRounds: 7,
    players: [
      "0xabc1234567890123456789012345678901234567",
      "0xdef1234567890123456789012345678901234567",
      "0xaaa1234567890123456789012345678901234567",
    ],
  },
];

// Mock player ranks for development
const MOCK_PLAYER_RANKS: PlayerRank[] = [
  {
    address: "0xabc1234567890123456789012345678901234567",
    wins: 2,
    totalGames: 4,
    lastWinTimestamp: Date.now() - 86400000 * 5,
    winRate: 50,
  },
  {
    address: "0xdef1234567890123456789012345678901234567",
    wins: 1,
    totalGames: 3,
    lastWinTimestamp: Date.now() - 86400000 * 2,
    winRate: 33.3,
  },
  {
    address: "0xaaa1234567890123456789012345678901234567",
    wins: 1,
    totalGames: 3,
    lastWinTimestamp: Date.now() - 86400000 * 10,
    winRate: 33.3,
  },
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
      let history: GameHistory[] = [];
      let ranks: PlayerRank[] = [];

      try {
        // Try to get data from the database
        [history, ranks] = await Promise.all([
          getGameHistory(),
          getTopPlayers(),
        ]);
      } catch (err) {
        // If database fails, use mock data
        console.warn("Using mock data:", err);
        history = MOCK_GAME_HISTORY;
        ranks = MOCK_PLAYER_RANKS;
      }

      setGameHistory(history.length > 0 ? history : MOCK_GAME_HISTORY);
      setPlayerRanks(ranks.length > 0 ? ranks : MOCK_PLAYER_RANKS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game data");
      // Fallback to mock data
      setGameHistory(MOCK_GAME_HISTORY);
      setPlayerRanks(MOCK_PLAYER_RANKS);
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
