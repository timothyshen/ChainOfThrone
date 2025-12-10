import { memo } from "react"
import { Globe, Building, BarChart3 } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { useRewardData } from "@/lib/hooks/useRewardData"

type GameResultType = "win" | "loss"

interface GameStats {
  supplyCenters?: number
  territories?: number
  alliances?: number
  betrayals?: number
  totalYears?: number
  winnerName?: `0x${string}`
  winnerSupplyCenters?: number
}

interface GameStatsCardProps {
  gameAddress: `0x${string}`
  type: GameResultType
  stats: GameStats
  year: string
}

/**
 * GameStatsCard Component
 *
 * Displays game statistics including castles, territories, and reward
 * Different styling for victory vs defeat
 */
export const GameStatsCard = memo(({ gameAddress, type, stats, year }: GameStatsCardProps) => {
  const { reward, isLoading } = useRewardData(gameAddress)

  if (type === "win") {
    return (
      <Card className="border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
        <CardHeader className="pb-2 pt-4 px-4">
          <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            Diplomatic Victory
          </h3>
        </CardHeader>
        <CardContent className="px-4 py-2 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <span className="text-foreground">Castles</span>
            </div>
            <span className="font-semibold text-foreground">
              {stats.supplyCenters || 5}/5
            </span>
          </div>
        </CardContent>
        <CardFooter className="px-4 pt-2 pb-4 border-t border-amber-200 dark:border-amber-900/30">
          <div className="flex justify-between items-center w-full">
            <span className="font-medium text-foreground">Reward</span>
            <span className="font-bold text-lg text-amber-700 dark:text-amber-400">
              {isLoading ? "..." : reward || "0"}
            </span>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border border-border bg-surface-2">
      <CardHeader className="pb-2 pt-4 px-4">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Diplomatic Standing
        </h3>
      </CardHeader>
      <CardContent className="px-4 py-2 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            <span className="text-foreground">Your Castles</span>
          </div>
          <span className="font-semibold text-foreground">
            {stats.supplyCenters || 8}/5
          </span>
        </div>
      </CardContent>
    </Card>
  )
})

GameStatsCard.displayName = "GameStatsCard"
