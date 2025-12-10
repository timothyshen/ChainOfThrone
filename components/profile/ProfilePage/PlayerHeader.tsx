import { memo } from "react"
import { Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { PlayerStats } from "@/lib/types/profilePage"

interface PlayerHeaderProps {
  player: PlayerStats
}

/**
 * PlayerHeader Component
 *
 * Displays player avatar, name, rank, level, and core stats
 */
export const PlayerHeader = memo(({ player }: PlayerHeaderProps) => {
  return (
    <Card className="bg-card border-border mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={player.avatar || "/placeholder.svg"}
              alt={player.name}
            />
            <AvatarFallback className="text-2xl bg-surface-3">
              {player.name.charAt(0)}
              {player.name.split(" ")[1]?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Name and Rank */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
              <Badge className="bg-yellow-600 text-yellow-100">
                <Crown className="w-3 h-3 mr-1" />
                {player.rank}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {player.level}
                </div>
                <div className="text-sm text-text-secondary">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {player.wins}
                </div>
                <div className="text-sm text-text-secondary">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {player.losses}
                </div>
                <div className="text-sm text-text-secondary">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {player.winRate}%
                </div>
                <div className="text-sm text-text-secondary">Win Rate</div>
              </div>
            </div>

            {/* Experience Bar */}
            <div className="space-y-2 text-foreground">
              <div className="flex justify-between text-sm">
                <span>Experience</span>
                <span>
                  {player.experience} / {player.maxExperience}
                </span>
              </div>
              <Progress
                value={(player.experience / player.maxExperience) * 100}
                className="h-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

PlayerHeader.displayName = "PlayerHeader"
