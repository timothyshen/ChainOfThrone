import { memo } from "react"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Match } from "./types"

interface MatchHistorySectionProps {
  matches: Match[]
}

/**
 * MatchHistorySection Component
 *
 * Displays recent match history with results, opponents, and duration
 */
export const MatchHistorySection = memo(
  ({ matches }: MatchHistorySectionProps) => {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>Recent Match History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
              >
                {/* Match Info */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant={match.result === "win" ? "default" : "destructive"}
                    className={
                      match.result === "win"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {match.result.toUpperCase()}
                  </Badge>
                  <div>
                    <div className="font-semibold">vs {match.opponent}</div>
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {match.mapName}
                    </div>
                  </div>
                </div>

                {/* Match Metadata */}
                <div className="text-right text-sm text-slate-400">
                  <div>{match.duration}</div>
                  <div>{match.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
)

MatchHistorySection.displayName = "MatchHistorySection"
