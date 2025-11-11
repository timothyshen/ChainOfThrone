import { memo } from "react"
import { Sword } from "lucide-react"
import type { BattleProgressProps } from "@/lib/types/gameOperationPanel"

/**
 * BattleProgress Component
 *
 * Displays real-time battle progress with health bars and damage indicators
 */
export const BattleProgress = memo(({ activeBattle, isMobile = false }: BattleProgressProps) => {
  if (!activeBattle) return null

  return (
    <div className="space-y-2">
      <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sword className="w-4 h-4 text-red-400" />
          <span className="text-red-400 font-semibold">Battle in Progress</span>
        </div>

        {activeBattle.phase === "combat" && (
          <>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${activeBattle.progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span>Attacker: -{activeBattle.attackerDamage}</span>
              <span>Defender: -{activeBattle.defenderDamage}</span>
            </div>
          </>
        )}

        {activeBattle.phase === "results" && (
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                activeBattle.winner === "attacker" ? "text-green-400" : "text-red-400"
              }`}
            >
              {activeBattle.winner === "attacker" ? "Victory!" : "Defeat!"}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

BattleProgress.displayName = "BattleProgress"
