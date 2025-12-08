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
          className="bg-slate-800 border-slate-600 text-white p-0 max-w-[220px]"
        >
          <div className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              {territory.isCastle ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : (
                <Flag className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="font-bold text-sm">{territory.name}</p>
                {territory.isCastle && (
                  <p className="text-[10px] text-amber-400 font-medium">
                    Castle (Win Condition)
                  </p>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Owner:</span>
              <span className={`font-medium ${
                isPlayerOwned ? "text-blue-400" :
                isEnemyOwned ? "text-red-400" :
                "text-slate-500"
              }`}>
                {isPlayerOwned ? "You" : isEnemyOwned ? "Enemy" : "Neutral"}
              </span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Type:</span>
              <span className={`font-medium flex items-center gap-1 ${
                territory.isCastle ? "text-amber-400" : "text-slate-300"
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
              <div className="pt-2 border-t border-slate-700 space-y-1">
                {friendlyUnits > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Your Army:
                    </span>
                    <span className="font-bold text-green-400">{friendlyUnits} units</span>
                  </div>
                )}
                {enemyUnits > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-400 flex items-center gap-1">
                      <Sword className="w-3 h-3" />
                      Enemy Army:
                    </span>
                    <span className="font-bold text-red-400">{enemyUnits} units</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Hint */}
            <div className="pt-2 border-t border-slate-700">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                {friendlyUnits > 0 ? (
                  <>
                    <Target className="w-3 h-3 text-blue-400" />
                    <span>Tap to select your army</span>
                  </>
                ) : enemyUnits > 0 && territory.isCastle ? (
                  <>
                    <Sword className="w-3 h-3 text-red-400" />
                    <span>Capture this castle to win!</span>
                  </>
                ) : isNeutral && territory.isCastle ? (
                  <>
                    <Crown className="w-3 h-3 text-amber-400" />
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
