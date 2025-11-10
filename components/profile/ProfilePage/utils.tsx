import { Trophy, Crown, Shield, Star, Award } from "lucide-react"
import type { Achievement } from "./types"

/**
 * Get badge color based on achievement rarity
 */
export function getRarityColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "bg-gray-500"
    case "rare":
      return "bg-blue-500"
    case "epic":
      return "bg-purple-500"
    case "legendary":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

/**
 * Get icon component based on achievement icon name
 */
export function getAchievementIcon(icon: string) {
  switch (icon) {
    case "trophy":
      return <Trophy className="w-4 h-4" />
    case "crown":
      return <Crown className="w-4 h-4" />
    case "shield":
      return <Shield className="w-4 h-4" />
    case "star":
      return <Star className="w-4 h-4" />
    default:
      return <Award className="w-4 h-4" />
  }
}
