"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGameHistory } from "./useGameHistory";
import type { PlayerStats, Achievement, Match } from "@/lib/types/profilePage";
import type { GameHistory } from "@/lib/types/setup";

/**
 * Calculate player level based on total games and wins
 * Simple formula: level = floor(sqrt(totalGames * wins)) + 1
 */
function calculateLevel(totalGames: number, wins: number): number {
  return Math.floor(Math.sqrt(totalGames * wins)) + 1;
}

/**
 * Calculate experience points
 * Each win = 100 XP, each game played = 25 XP
 */
function calculateExperience(
  totalGames: number,
  wins: number
): { experience: number; maxExperience: number } {
  const experience = wins * 100 + totalGames * 25;
  const level = calculateLevel(totalGames, wins);
  const maxExperience = level * 500;
  return { experience: experience % maxExperience, maxExperience };
}

/**
 * Determine player rank based on win rate and total games
 */
function calculateRank(winRate: number, totalGames: number): string {
  if (totalGames < 5) return "Recruit";
  if (winRate >= 80 && totalGames >= 20) return "Conqueror";
  if (winRate >= 70 && totalGames >= 15) return "General";
  if (winRate >= 60 && totalGames >= 10) return "Knight";
  if (winRate >= 50) return "Soldier";
  if (winRate >= 30) return "Squire";
  return "Peasant";
}

/**
 * Determine favorite strategy based on game patterns
 * This is a placeholder - real implementation would analyze move patterns
 */
function calculateFavoriteStrategy(wins: number, totalGames: number): string {
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  if (winRate >= 70) return "Aggressive Expansion";
  if (winRate >= 50) return "Balanced Approach";
  return "Defensive Play";
}

/**
 * Generate achievements based on player stats
 */
function generateAchievements(
  totalGames: number,
  wins: number,
  _gameHistory: GameHistory[]
): Achievement[] {
  const achievements: Achievement[] = [];

  if (wins >= 1) {
    achievements.push({
      id: "first-victory",
      name: "First Victory",
      description: "Win your first battle",
      icon: "trophy",
      unlockedAt: new Date().toISOString().split("T")[0],
      rarity: "common",
    });
  }

  if (wins >= 5) {
    achievements.push({
      id: "rising-star",
      name: "Rising Star",
      description: "Win 5 games",
      icon: "star",
      unlockedAt: new Date().toISOString().split("T")[0],
      rarity: "common",
    });
  }

  if (wins >= 10) {
    achievements.push({
      id: "veteran",
      name: "Veteran",
      description: "Win 10 games",
      icon: "medal",
      unlockedAt: new Date().toISOString().split("T")[0],
      rarity: "rare",
    });
  }

  if (totalGames >= 25) {
    achievements.push({
      id: "dedicated-player",
      name: "Dedicated Player",
      description: "Play 25 games",
      icon: "crown",
      unlockedAt: new Date().toISOString().split("T")[0],
      rarity: "rare",
    });
  }

  if (wins >= 25) {
    achievements.push({
      id: "master-strategist",
      name: "Master Strategist",
      description: "Win 25 games",
      icon: "shield",
      unlockedAt: new Date().toISOString().split("T")[0],
      rarity: "epic",
    });
  }

  return achievements;
}

/**
 * Convert GameHistory to Match format for display
 */
function convertToMatches(
  gameHistory: GameHistory[],
  playerAddress: string
): Match[] {
  return gameHistory.slice(0, 10).map((game, index) => {
    const isWinner =
      game.winner.toLowerCase() === playerAddress.toLowerCase();
    const opponent =
      game.players.find(
        (p) => p.toLowerCase() !== playerAddress.toLowerCase()
      ) || "Unknown";

    // Estimate duration based on rounds (assume ~2 min per round)
    const minutes = game.totalRounds * 2;
    const duration = `${Math.floor(minutes / 60)}:${String(
      minutes % 60
    ).padStart(2, "0")}`;

    return {
      id: `${game.gameAddress}-${index}`,
      opponent: `${opponent.slice(0, 6)}...${opponent.slice(-4)}`,
      result: isWinner ? "win" : "loss",
      duration,
      date: new Date(game.timestamp).toISOString().split("T")[0],
      mapName: "Westeros",
    };
  });
}

/**
 * Shorten address for display
 */
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface UsePlayerProfileDataReturn {
  playerStats: PlayerStats | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

/**
 * Hook to fetch and calculate player profile data from blockchain/database
 * Replaces mock data with real data sources
 */
export function usePlayerProfileData(): UsePlayerProfileDataReturn {
  const { address, isConnected } = useAccount();
  const { gameHistory, playerRanks, isLoading, error } = useGameHistory();

  const playerStats = useMemo<PlayerStats | null>(() => {
    if (!address || !isConnected) return null;

    // Find player in rankings
    const playerRank = playerRanks.find(
      (rank) => rank.address.toLowerCase() === address.toLowerCase()
    );

    // Filter games where this player participated
    const playerGames = gameHistory.filter((game) =>
      game.players.some((p) => p.toLowerCase() === address.toLowerCase())
    );

    const totalGames = playerRank?.totalGames || playerGames.length;
    const wins = playerRank?.wins || 0;
    const losses = totalGames - wins;
    const winRate =
      playerRank?.winRate || (totalGames > 0 ? (wins / totalGames) * 100 : 0);

    const level = calculateLevel(totalGames, wins);
    const { experience, maxExperience } = calculateExperience(totalGames, wins);
    const rank = calculateRank(winRate, totalGames);
    const favoriteStrategy = calculateFavoriteStrategy(wins, totalGames);
    const achievements = generateAchievements(totalGames, wins, playerGames);
    const recentMatches = convertToMatches(playerGames, address);

    return {
      id: address,
      name: shortenAddress(address),
      avatar: `/placeholder.svg?height=100&width=100&text=${address.slice(
        2,
        4
      )}`,
      level,
      experience,
      maxExperience,
      rank,
      totalGames,
      wins,
      losses,
      winRate: Math.round(winRate),
      favoriteStrategy,
      achievements,
      recentMatches,
    };
  }, [address, isConnected, gameHistory, playerRanks]);

  return {
    playerStats,
    isLoading,
    error,
    isConnected,
  };
}
