import { memo } from "react"
import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Achievement } from "@/lib/types/profilePage"
import { getRarityColor, getAchievementIcon } from "@/lib/utils/profileUtils"

interface AchievementsSectionProps {
  achievements: Achievement[]
}

/**
 * AchievementsSection Component
 *
 * Displays achievements grid with rarity colors and unlock dates
 */
export const AchievementsSection = memo(
  ({ achievements }: AchievementsSectionProps) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className="bg-slate-800 border-slate-700 text-white"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Achievement Icon */}
                <div
                  className={`p-2 rounded-full ${getRarityColor(
                    achievement.rarity
                  )}`}
                >
                  {getAchievementIcon(achievement.icon)}
                </div>

                {/* Achievement Details */}
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{achievement.name}</h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {achievement.description}
                  </p>

                  {/* Rarity and Date */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {achievement.rarity}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {achievement.unlockedAt}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
)

AchievementsSection.displayName = "AchievementsSection"
