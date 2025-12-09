"use client"

import { memo, useEffect, useState } from "react"
import { Crown, AlertTriangle, Trophy, Swords } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RoundTransitionOverlayProps {
  isVisible: boolean
  fromRound: number
  toRound: number
  playerCastles: number
  enemyCastles: number
  castlesToWin?: number
  onComplete?: () => void
}

/**
 * RoundTransitionOverlay Component
 *
 * Visual overlay shown during round transitions:
 * - Dims the map
 * - Shows "Round X Complete" banner
 * - Shows warning if close to winning/losing
 * - Animates to next round
 */
export const RoundTransitionOverlay = memo(({
  isVisible,
  fromRound,
  toRound,
  playerCastles,
  enemyCastles,
  castlesToWin = 3,
  onComplete,
}: RoundTransitionOverlayProps) => {
  const [phase, setPhase] = useState<"complete" | "warning" | "next">("complete")

  const playerClose = playerCastles >= castlesToWin - 1
  const enemyClose = enemyCastles >= castlesToWin - 1

  useEffect(() => {
    if (!isVisible) {
      setPhase("complete")
      return
    }

    // Phase 1: Show "Round Complete" (1s)
    setPhase("complete")

    // Phase 2: Show warning if applicable (after 1s, for 1.5s)
    const warningTimer = setTimeout(() => {
      if (playerClose || enemyClose) {
        setPhase("warning")
      } else {
        setPhase("next")
      }
    }, 1000)

    // Phase 3: Show "Next Round" (after warning or 1s)
    const nextTimer = setTimeout(() => {
      setPhase("next")
    }, playerClose || enemyClose ? 2500 : 1000)

    // Complete and hide (after 3.5s total)
    const completeTimer = setTimeout(() => {
      onComplete?.()
    }, playerClose || enemyClose ? 4000 : 2500)

    return () => {
      clearTimeout(warningTimer)
      clearTimeout(nextTimer)
      clearTimeout(completeTimer)
    }
  }, [isVisible, playerClose, enemyClose, onComplete])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900"
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            {phase === "complete" && (
              <motion.div
                key="complete"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-3">
                  <Swords className="w-10 h-10 text-amber-400" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                  Round {fromRound}
                </h1>
                <p className="text-xl text-amber-400 font-medium">COMPLETE</p>
              </motion.div>
            )}

            {phase === "warning" && (
              <motion.div
                key="warning"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {playerClose && playerCastles >= castlesToWin ? (
                  // Player wins!
                  <div className="space-y-4">
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                    <h1 className="text-4xl md:text-6xl font-bold text-amber-400">
                      VICTORY!
                    </h1>
                    <p className="text-xl text-green-400">
                      You control {playerCastles} castles!
                    </p>
                  </div>
                ) : enemyClose && enemyCastles >= castlesToWin ? (
                  // Enemy wins
                  <div className="space-y-4">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto animate-pulse" />
                    <h1 className="text-4xl md:text-6xl font-bold text-red-400">
                      DEFEAT
                    </h1>
                    <p className="text-xl text-red-300">
                      Enemy controls {enemyCastles} castles
                    </p>
                  </div>
                ) : playerClose ? (
                  // Player close to winning
                  <div className="space-y-4">
                    <Crown className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
                    <h1 className="text-3xl md:text-5xl font-bold text-amber-400">
                      ONE MORE CASTLE!
                    </h1>
                    <p className="text-xl text-green-400">
                      You have {playerCastles}/{castlesToWin} castles
                    </p>
                    <p className="text-sm text-slate-400">
                      Capture 1 more to win the game!
                    </p>
                  </div>
                ) : (
                  // Enemy close to winning
                  <div className="space-y-4">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto animate-pulse" />
                    <h1 className="text-3xl md:text-5xl font-bold text-red-400">
                      DANGER!
                    </h1>
                    <p className="text-xl text-red-300">
                      Enemy has {enemyCastles}/{castlesToWin} castles
                    </p>
                    <p className="text-sm text-slate-400">
                      Stop them before they win!
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {phase === "next" && (
              <motion.div
                key="next"
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                  Round {toRound}
                </h1>
                <p className="text-xl text-blue-400 font-medium">BEGIN!</p>

                {/* Castle Status */}
                <div className="flex items-center justify-center gap-8 mt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">You</p>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-blue-400">
                        {playerCastles}/{castlesToWin}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-600">vs</div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Enemy</p>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-red-400" />
                      <span className="text-2xl font-bold text-red-400">
                        {enemyCastles}/{castlesToWin}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

RoundTransitionOverlay.displayName = "RoundTransitionOverlay"
