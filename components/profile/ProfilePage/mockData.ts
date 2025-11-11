import type { PlayerStats } from "@/lib/types/profilePage"

/**
 * Mock player data for ProfilePage
 * TODO: Replace with real data fetching in future
 */
export const getMockPlayerStats = (): PlayerStats => ({
  id: "p1",
  name: "Player 1",
  avatar: "/placeholder.svg?height=100&width=100&text=P1",
  level: 15,
  experience: 2350,
  maxExperience: 3000,
  rank: "Knight",
  totalGames: 47,
  wins: 32,
  losses: 15,
  winRate: 68,
  favoriteStrategy: "Aggressive Expansion",
  achievements: [
    {
      id: "1",
      name: "First Victory",
      description: "Win your first battle",
      icon: "trophy",
      unlockedAt: "2024-01-15",
      rarity: "common",
    },
    {
      id: "2",
      name: "Castle Conqueror",
      description: "Capture 10 castles",
      icon: "crown",
      unlockedAt: "2024-02-03",
      rarity: "rare",
    },
    {
      id: "3",
      name: "Master Strategist",
      description: "Win 5 games in a row",
      icon: "star",
      unlockedAt: "2024-02-20",
      rarity: "epic",
    },
  ],
  recentMatches: [
    {
      id: "1",
      opponent: "Player 2",
      result: "win",
      duration: "12:34",
      date: "2024-03-01",
      mapName: "Westeros",
    },
    {
      id: "2",
      opponent: "Player 2",
      result: "loss",
      duration: "08:45",
      date: "2024-02-28",
      mapName: "Westeros",
    },
    {
      id: "3",
      opponent: "Player 2",
      result: "win",
      duration: "15:22",
      date: "2024-02-25",
      mapName: "Westeros",
    },
  ],
})
