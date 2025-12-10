import { memo } from "react"
import { motion } from "framer-motion"
import { Crown, Flag, Map, Swords } from "lucide-react"
import { cn } from "@/lib/utils"

type GameResultType = "win" | "loss"

interface VictoryIconProps {
  type: GameResultType
}

/**
 * VictoryIcon Component
 *
 * Animated icon display for game results
 * Shows crown with flag for victory, map with swords for defeat
 */
export const VictoryIcon = memo(({ type }: VictoryIconProps) => {
  if (type === "win") {
    return (
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
        className="relative"
      >
        <div
          className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center",
            "bg-surface-2 border-2",
            "border-amber-500"
          )}
        >
          <Crown className="h-10 w-10 text-blue-600 dark:text-blue-400 text-primary" />
        </div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="absolute -top-1 -right-1 bg-amber-100 dark:bg-amber-900/30 p-1 rounded-full"
        >
          <Flag className="h-6 w-6 text-amber-500" />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
      className="relative"
    >
      <div className="h-20 w-20 rounded-full flex items-center justify-center bg-surface-2 border-2 border-border">
        <Map className="h-10 w-10 text-blue-600 dark:text-blue-400 text-primary" />
      </div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="absolute -bottom-1 -right-1 bg-surface-3 p-1 rounded-full"
      >
        <Swords className="h-6 w-6 text-text-secondary" />
      </motion.div>
    </motion.div>
  )
})

VictoryIcon.displayName = "VictoryIcon"
