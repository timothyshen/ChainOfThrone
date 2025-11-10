/**
 * Profile Page Types
 */

export interface PlayerStats {
  id: string
  name: string
  avatar: string
  level: number
  experience: number
  maxExperience: number
  rank: string
  totalGames: number
  wins: number
  losses: number
  winRate: number
  favoriteStrategy: string
  achievements: Achievement[]
  recentMatches: Match[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface Match {
  id: string
  opponent: string
  result: "win" | "loss" | "draw"
  duration: string
  date: string
  mapName: string
}
