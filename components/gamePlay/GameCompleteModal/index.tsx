"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Subcomponents
import { VictoryIcon } from "./VictoryIcon"
import { GameStatsCard } from "./GameStatsCard"
import { RewardSection } from "./RewardSection"
import { ModalActions } from "./ModalActions"

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

interface DiplomacyResultModalProps {
  gameAddress: `0x${string}`
  type: GameResultType
  open: boolean
  onOpenChange: (open: boolean) => void
  year: string
  stats?: GameStats
}

/**
 * DiplomacyResultModal Component
 *
 * Main game completion modal
 * Displays victory/defeat results, stats, and reward claiming
 */
export function DiplomacyResultModal({
  type = "win",
  open = false,
  onOpenChange,
  year = "Fall, 1908",
  stats = {},
  gameAddress = "0x0000000000000000000000000000000000000000",
}: DiplomacyResultModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleNewGame = useCallback(() => {
    // Start new game
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DialogHeader className="pt-8 pb-2 px-6 text-center">
              <div className="flex justify-center mb-4">
                <VictoryIcon type={type} />
              </div>

              <DialogTitle className="text-2xl font-bold text-center">
                {type === "win" ? "Diplomatic Victory!" : "Diplomatic Defeat"}
              </DialogTitle>

              <DialogDescription className="text-center pt-1">
                <span className="h-10 w-10 text-blue-600 dark:text-blue-400 text-primary">
                  Player 1
                </span>
                {type === "win" ? " has achieved dominance over Europe" : " has been outmaneuvered"}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "p-3 rounded-lg mb-4 border",
                  type === "win"
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-900/30"
                    : "bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border-slate-200 dark:border-slate-700"
                )}
              >
                <p className="font-medium text-lg text-slate-800 dark:text-slate-200 text-center">
                  {type === "win"
                    ? "The balance of power has shifted in your favor!"
                    : "The diplomatic landscape has shifted against you."}
                </p>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <GameStatsCard
                  gameAddress={gameAddress}
                  type={type}
                  stats={stats}
                  year={year}
                />
              </motion.div>

              {/* Reward Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <RewardSection type={type} gameAddress={gameAddress} />
              </motion.div>
            </div>

            <DialogFooter className="px-6 pb-6 flex-col sm:flex-col gap-3">
              <ModalActions
                type={type}
                onClose={handleClose}
                onNewGame={handleNewGame}
              />
            </DialogFooter>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
