"use client"

import { memo, useMemo } from "react"
import { Crown, Users, Flag, AlertTriangle, Target } from "lucide-react"
import { useGameStateContext } from "@/lib/contexts/GameContext"
import { useAccount } from "wagmi"

interface CastleStats {
  player: number
  enemy: number
  neutral: number
  total: number
}

interface UnitStats {
  player: number
  enemy: number
}

interface TerritoryStats {
  player: number
  enemy: number
  neutral: number
}

const CASTLES_TO_WIN = 3

/**
 * GameStatusBar Component
 *
 * Displays critical game state at-a-glance:
 * - Castle count (PRIMARY - win condition!)
 * - Warning banners when close to winning/losing
 * - Unit count
 * - Territory count
 */
export const GameStatusBar = memo(({ isMobile }: { isMobile?: boolean }) => {
  const { territories, armies, playerAddresses } = useGameStateContext()
  const { address } = useAccount()

  const zeroAddress = "0x0000000000000000000000000000000000000000"

  // Calculate castle statistics
  const castleStats = useMemo((): CastleStats => {
    const flatTerritories = territories.flat()
    const castles = flatTerritories.filter((t) => t.isCastle)

    let player = 0
    let enemy = 0
    let neutral = 0

    castles.forEach((castle) => {
      if (!castle.player || castle.player.toLowerCase() === zeroAddress.toLowerCase()) {
        neutral++
      } else if (castle.player.toLowerCase() === address?.toLowerCase()) {
        player++
      } else {
        enemy++
      }
    })

    return { player, enemy, neutral, total: castles.length }
  }, [territories, address])

  // Calculate unit statistics
  const unitStats = useMemo((): UnitStats => {
    let player = 0
    let enemy = 0

    armies.forEach((army) => {
      if (army.owner.toLowerCase() === address?.toLowerCase()) {
        player += army.size
      } else {
        enemy += army.size
      }
    })

    return { player, enemy }
  }, [armies, address])

  // Calculate territory statistics
  const territoryStats = useMemo((): TerritoryStats => {
    const flatTerritories = territories.flat()
    let player = 0
    let enemy = 0
    let neutral = 0

    flatTerritories.forEach((territory) => {
      if (!territory.player || territory.player.toLowerCase() === zeroAddress.toLowerCase()) {
        neutral++
      } else if (territory.player.toLowerCase() === address?.toLowerCase()) {
        player++
      } else {
        enemy++
      }
    })

    return { player, enemy, neutral }
  }, [territories, address])

  // Determine warning state
  const warningState = useMemo(() => {
    const playerCastlesNeeded = CASTLES_TO_WIN - castleStats.player
    const enemyCastlesNeeded = CASTLES_TO_WIN - castleStats.enemy

    if (playerCastlesNeeded === 1) {
      return { type: "playerCloseToWin", message: "Capture 1 more castle to win!" }
    }
    if (enemyCastlesNeeded === 1) {
      return { type: "enemyCloseToWin", message: "Danger: Enemy needs 1 more castle to win!" }
    }
    return null
  }, [castleStats])

  // Check if player has submitted this round
  const hasSubmittedRound = useMemo(() => {
    if (!address || !playerAddresses) return false
    const playerState = playerAddresses.find(
      (p) => p.address.toLowerCase() === address.toLowerCase()
    )
    return playerState?.roundSubmitted ?? false
  }, [address, playerAddresses])

  return (
    <div className="w-full bg-surface-1/95 backdrop-blur-sm border-b border-border px-3 py-2 md:px-4 md:py-3 shadow-soft">
      {/* Warning Banner */}
      {warningState && (
        <div
          className={`mb-2 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-bold animate-pulse ${
            warningState.type === "playerCloseToWin"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-700"
              : "bg-game-enemy-light border border-game-enemy/50 text-game-enemy"
          }`}
        >
          {warningState.type === "playerCloseToWin" ? (
            <Target className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{warningState.message}</span>
        </div>
      )}

      {/* Main Stats Row */}
      <div className={`flex items-center justify-between ${isMobile ? "flex-col gap-2" : "flex-row gap-4"}`}>
        {/* Castle Count - PRIMARY (Win Condition!) */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 md:w-6 md:h-6 text-game-castle" />
            <span className="text-xs md:text-sm font-medium text-text-secondary">CASTLES:</span>
          </div>

          {/* Player Castles */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-bold text-game-player">
                {castleStats.player}/{CASTLES_TO_WIN}
              </span>
              <span className="text-[10px] md:text-xs text-text-muted">You</span>
            </div>

            {/* Progress Bar */}
            <div className="w-16 md:w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-game-player transition-all duration-300"
                style={{ width: `${(castleStats.player / CASTLES_TO_WIN) * 100}%` }}
              />
            </div>
          </div>

          <span className="text-text-muted font-medium">vs</span>

          {/* Enemy Castles */}
          <div className="flex items-center gap-2">
            <div className="w-16 md:w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-game-enemy transition-all duration-300"
                style={{ width: `${(castleStats.enemy / CASTLES_TO_WIN) * 100}%` }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-bold text-game-enemy">
                {castleStats.enemy}/{CASTLES_TO_WIN}
              </span>
              <span className="text-[10px] md:text-xs text-text-muted">Enemy</span>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className={`flex items-center gap-4 md:gap-6 ${isMobile ? "w-full justify-center" : ""}`}>
          {/* Unit Count */}
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Users className="w-4 h-4 text-text-secondary" />
            <span className="text-game-player font-medium">{unitStats.player}</span>
            <span className="text-text-muted">vs</span>
            <span className="text-game-enemy font-medium">{unitStats.enemy}</span>
          </div>

          {/* Territory Count */}
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Flag className="w-4 h-4 text-text-secondary" />
            <span className="text-game-player font-medium">{territoryStats.player}</span>
            <span className="text-text-muted">vs</span>
            <span className="text-game-enemy font-medium">{territoryStats.enemy}</span>
          </div>

          {/* Turn Status */}
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              hasSubmittedRound
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-amber-50 text-amber-700 border border-amber-300"
            }`}
          >
            {hasSubmittedRound ? "Move Submitted" : "Your Turn"}
          </div>
        </div>
      </div>
    </div>
  )
})

GameStatusBar.displayName = "GameStatusBar"
