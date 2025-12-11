"use client"

import { memo, useState } from "react"
import { ChevronDown, ChevronUp, Crown, MapPin, Swords, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuickRulesPanelProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
  className?: string
}

/**
 * QuickRulesPanel Component
 *
 * Compact, always-visible game rules reference
 * Shows essential info: win condition, legend, movement hints
 */
export const QuickRulesPanel = memo(function QuickRulesPanel({
  isCollapsible = true,
  defaultExpanded = true,
  className,
}: QuickRulesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={cn("flex-shrink-0", className)}>
      <button
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between text-left",
          isCollapsible && "cursor-pointer hover:bg-surface-2/50 transition-colors"
        )}
        onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
        disabled={!isCollapsible}
      >
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-game-castle" />
          <span className="font-medium text-sm">Quick Rules</span>
        </div>
        {isCollapsible && (
          isExpanded ? (
            <ChevronUp className="h-4 w-4 text-text-secondary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          )
        )}
      </button>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-4 space-y-3">
          {/* Win Condition */}
          <div className="flex items-center gap-2 p-2 bg-game-castle/10 rounded-md border border-game-castle/20">
            <Crown className="h-4 w-4 text-game-castle flex-shrink-0" />
            <span className="text-xs font-medium">
              Control <span className="text-game-castle font-bold">3 of 5</span> castles to win
            </span>
          </div>

          {/* Legend */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Legend</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-game-castle/30 border border-game-castle/50 flex items-center justify-center">
                  <Crown className="h-2.5 w-2.5 text-game-castle" />
                </div>
                <span className="text-text-secondary">Castle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-game-player/30 border border-game-player/50" />
                <span className="text-text-secondary">Your territory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-game-enemy/30 border border-game-enemy/50" />
                <span className="text-text-secondary">Enemy territory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-surface-3 border border-border" />
                <span className="text-text-secondary">Neutral</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">How to Play</p>
            <div className="space-y-1 text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 mt-0.5 text-game-player flex-shrink-0" />
                <span>Tap your army, then tap adjacent cell to move</span>
              </div>
              <div className="flex items-start gap-2">
                <Swords className="h-3 w-3 mt-0.5 text-game-enemy flex-shrink-0" />
                <span>Move into enemy territory to attack</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3 w-3 mt-0.5 text-game-castle flex-shrink-0" />
                <span>Castles give <span className="font-medium text-foreground">2.5x</span> defense bonus</span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
})

export default QuickRulesPanel
