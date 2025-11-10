import { memo } from "react"
import { Target, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlayerStats } from "./types"

interface StatsSectionProps {
  player: PlayerStats
}

/**
 * StatsSection Component
 *
 * Displays combat statistics and strategy profile in two-column grid
 */
export const StatsSection = memo(({ player }: StatsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Combat Statistics */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Combat Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Total Games</span>
            <span className="font-bold">{player.totalGames}</span>
          </div>
          <div className="flex justify-between">
            <span>Victories</span>
            <span className="font-bold text-green-400">{player.wins}</span>
          </div>
          <div className="flex justify-between">
            <span>Defeats</span>
            <span className="font-bold text-red-400">{player.losses}</span>
          </div>
          <div className="flex justify-between">
            <span>Win Rate</span>
            <span className="font-bold text-purple-400">
              {player.winRate}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Profile */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Strategy Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Favorite Strategy</span>
            <span className="font-bold text-blue-400">
              {player.favoriteStrategy}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Current Rank</span>
            <Badge className="bg-yellow-600 text-yellow-100">
              {player.rank}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Level</span>
            <span className="font-bold text-blue-400">{player.level}</span>
          </div>
          <div className="flex justify-between">
            <span>Achievements</span>
            <span className="font-bold text-purple-400">
              {player.achievements.length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

StatsSection.displayName = "StatsSection"
