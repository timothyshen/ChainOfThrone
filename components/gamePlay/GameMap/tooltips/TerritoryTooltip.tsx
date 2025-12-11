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
  playerCastleCount?: number
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
const CASTLES_TO_WIN = 3

export const TerritoryTooltip = memo(({
  territory,
  children,
  friendlyUnits,
  enemyUnits,
  isPlayerOwned,
  isEnemyOwned,
  hasArmy,
  delayDuration = 300,
  playerCastleCount = 0,
}: TerritoryTooltipProps) => {
  const hasOwner = territory.player && territory.player.toLowerCase() !== zeroAddress.toLowerCase()
  const isNeutral = !hasOwner
  const castlesNeeded = CASTLES_TO_WIN - playerCastleCount
  const wouldWinIfCaptured = territory.isCastle && !isPlayerOwned && castlesNeeded === 1

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

            {/* Castle Defense Bonus */}
            {territory.isCastle && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Defense:</span>
                <span className="font-bold text-game-castle flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  2.5x bonus
                </span>
              </div>
            )}

            {/* Strategic Hint for Castles */}
            {territory.isCastle && !isPlayerOwned && (
              <div className={`mt-1 p-1.5 rounded text-[10px] font-medium ${
                wouldWinIfCaptured
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-game-castle/10 text-game-castle border border-game-castle/30"
              }`}>
                {wouldWinIfCaptured ? (
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Capture this to WIN!
                  </span>
                ) : (
                  <span>Capture = {playerCastleCount + 1}/3 castles</span>
                )}
              </div>
            )}

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
