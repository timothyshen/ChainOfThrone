"use client"

import { memo, useMemo, useState } from "react"
import { Crown, ChevronDown, HelpCircle } from "lucide-react"
import { useGameStateContext } from "@/lib/contexts/GameContext"
import { useAccount } from "wagmi"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { GameStatusPanel } from "./GameStatusPanel"
import { HowToPlayDialog } from "@/components/home/HowToPlay"

const CASTLES_TO_WIN = 3
const zeroAddress = "0x0000000000000000000000000000000000000000"

/**
 * MiniStatusBar Component
 *
 * Minimal status bar for mobile showing only:
 * - Castle progress (win condition)
 * - Turn status badge
 * - Tap to expand full status drawer
 */
export const MiniStatusBar = memo(function MiniStatusBar() {
  const { territories, playerAddresses } = useGameStateContext()
  const { address } = useAccount()
  const [showHelp, setShowHelp] = useState(false)

  // Calculate castle statistics
  const castleStats = useMemo(() => {
    const flatTerritories = territories.flat()
    const castles = flatTerritories.filter((t) => t.isCastle)

    let player = 0
    let enemy = 0

    castles.forEach((castle) => {
      if (!castle.player || castle.player.toLowerCase() === zeroAddress.toLowerCase()) {
        // neutral
      } else if (castle.player.toLowerCase() === address?.toLowerCase()) {
        player++
      } else {
        enemy++
      }
    })

    return { player, enemy }
  }, [territories, address])

  // Check if player has submitted this round
  const hasSubmittedRound = useMemo(() => {
    if (!address || !playerAddresses) return false
    const playerState = playerAddresses.find(
      (p) => p.address.toLowerCase() === address.toLowerCase()
    )
    return playerState?.roundSubmitted ?? false
  }, [address, playerAddresses])

  return (
    <>
      <div className="w-full h-12 px-4 flex items-center gap-2 bg-surface-1 border-b border-border">
        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 -ml-2 rounded-full hover:bg-surface-2 active:bg-surface-3 transition-colors flex-shrink-0"
          aria-label="How to play"
        >
          <HelpCircle className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Castle Progress - Drawer Trigger */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex-1 h-full flex items-center justify-between active:bg-surface-2/50 transition-colors rounded px-2">
              {/* Castle Progress - Primary Info */}
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-game-castle" />
                <div className="flex items-center gap-1.5 text-sm">
                  {/* Player Progress */}
                  <span className="font-bold text-game-player">
                    {castleStats.player}
                  </span>
                  <span className="text-text-muted">/3</span>

                  {/* Progress Bars */}
                  <div className="flex items-center gap-1 mx-1">
                    <div className="w-8 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-game-player transition-all duration-300"
                        style={{ width: `${(castleStats.player / CASTLES_TO_WIN) * 100}%` }}
                      />
                    </div>
                    <span className="text-text-muted">vs</span>
                    <div className="w-8 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-game-enemy transition-all duration-300"
                        style={{ width: `${(castleStats.enemy / CASTLES_TO_WIN) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Enemy Progress */}
                  <span className="font-bold text-game-enemy">
                    {castleStats.enemy}
                  </span>
                  <span className="text-text-muted">/3</span>
                </div>
              </div>

              {/* Right Side: Turn Status + Expand Icon */}
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-0.5 rounded text-sm font-medium ${
                    hasSubmittedRound
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-amber-50 text-amber-700 border border-amber-300"
                  }`}
                >
                  {hasSubmittedRound ? "Submitted" : "Your Turn"}
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </div>
            </button>
          </DrawerTrigger>

          <DrawerContent>
            <div className="max-h-[70vh] overflow-auto">
              <GameStatusPanel />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* How to Play Dialog */}
      <HowToPlayDialog open={showHelp} onOpenChange={setShowHelp} />
    </>
  )
})
