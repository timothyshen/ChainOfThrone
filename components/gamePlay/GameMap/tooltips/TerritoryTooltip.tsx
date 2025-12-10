"use client"

import { memo, ReactNode } from "react"
import { Crown, Flag, Users, Shield, Sword, Target } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Territory, Army } from "@/lib/types/game"

interface TerritoryTooltipProps {
  territory: Territory
  children: ReactNode
  friendlyUnits: number
  enemyUnits: number
  isPlayerOwned: boolean
  isEnemyOwned: boolean
  hasArmy: boolean
  delayDuration?: number
}

const zeroAddress = "0x0000000000000000000000000000000000000000"

/**
 * TerritoryTooltip Component
 *
 * Shows detailed territory information on hover:
 * - Territory name and type (Castle/Territory)
 * - Owner information
 * - Army details (friendly/enemy)
 * - Action hints
 */
export const TerritoryTooltip = memo(({
  territory,
  children,
  friendlyUnits,
  enemyUnits,
  isPlayerOwned,
  isEnemyOwned,
  hasArmy,
  delayDuration = 300,
}: TerritoryTooltipProps) => {
  const hasOwner = territory.player && territory.player.toLowerCase() !== zeroAddress.toLowerCase()
  const isNeutral = !hasOwner

  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover border-border text-popover-foreground shadow-soft p-0 max-w-[220px]"
        >
          <div className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              {territory.isCastle ? (
                <Crown className="w-5 h-5 text-game-castle" />
              ) : (
                <Flag className="w-5 h-5 text-text-secondary" />
              )}
              <div>
                <p className="font-bold text-sm">{territory.name}</p>
                {territory.isCastle && (
                  <p className="text-[10px] text-game-castle font-medium">
                    Castle (Win Condition)
                  </p>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Owner:</span>
              <span className={`font-medium ${
                isPlayerOwned ? "text-game-player" :
                isEnemyOwned ? "text-game-enemy" :
                "text-text-muted"
              }`}>
                {isPlayerOwned ? "You" : isEnemyOwned ? "Enemy" : "Neutral"}
              </span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Type:</span>
              <span className={`font-medium flex items-center gap-1 ${
                territory.isCastle ? "text-game-castle" : "text-foreground"
              }`}>
                {territory.isCastle ? (
                  <>
                    <Crown className="w-3 h-3" />
                    Castle
                  </>
                ) : (
                  <>
                    <Flag className="w-3 h-3" />
                    Territory
                  </>
                )}
              </span>
            </div>

            {/* Army Info */}
            {(friendlyUnits > 0 || enemyUnits > 0) && (
              <div className="pt-2 border-t border-border space-y-1">
                {friendlyUnits > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Your Army:
                    </span>
                    <span className="font-bold text-emerald-600">{friendlyUnits} units</span>
                  </div>
                )}
                {enemyUnits > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-game-enemy flex items-center gap-1">
                      <Sword className="w-3 h-3" />
                      Enemy Army:
                    </span>
                    <span className="font-bold text-game-enemy">{enemyUnits} units</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Hint */}
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-text-secondary flex items-center gap-1">
                {friendlyUnits > 0 ? (
                  <>
                    <Target className="w-3 h-3 text-game-player" />
                    <span>Tap to select your army</span>
                  </>
                ) : enemyUnits > 0 && territory.isCastle ? (
                  <>
                    <Sword className="w-3 h-3 text-game-enemy" />
                    <span>Capture this castle to win!</span>
                  </>
                ) : isNeutral && territory.isCastle ? (
                  <>
                    <Crown className="w-3 h-3 text-game-castle" />
                    <span>Move army here to claim!</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3 h-3" />
                    <span>Tap to view details</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

TerritoryTooltip.displayName = "TerritoryTooltip"
