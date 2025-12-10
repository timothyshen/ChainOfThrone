import { memo, useMemo } from "react"
import { Sword, AlertTriangle, CheckCircle, XCircle, Skull, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { truncateAddress } from "@/lib/utils"
import type { BattlePreviewProps } from "@/lib/types/gameOperationPanel"

type BattleOutcome = "win" | "lose" | "tie"

interface BattleResult {
  outcome: BattleOutcome
  attackerRemaining: number
  defenderRemaining: number
  survivors: number
}

/**
 * Calculate deterministic battle outcome
 * Combat is deterministic: higher unit count wins, difference survives
 * Ties result in BOTH armies being destroyed!
 */
function calculateBattleResult(attackerSize: number, defenderSize: number): BattleResult {
  if (attackerSize > defenderSize) {
    return {
      outcome: "win",
      attackerRemaining: attackerSize - defenderSize,
      defenderRemaining: 0,
      survivors: attackerSize - defenderSize,
    }
  } else if (attackerSize < defenderSize) {
    return {
      outcome: "lose",
      attackerRemaining: 0,
      defenderRemaining: defenderSize - attackerSize,
      survivors: defenderSize - attackerSize,
    }
  } else {
    // TIE - BOTH ARMIES DESTROYED!
    return {
      outcome: "tie",
      attackerRemaining: 0,
      defenderRemaining: 0,
      survivors: 0,
    }
  }
}

/**
 * BattlePreview Component
 *
 * Shows DETERMINISTIC battle outcome preview:
 * - Exact outcome (win/lose/tie)
 * - Survivor count
 * - Strong warning for ties (both armies die!)
 * - Suggestion to send more units if needed
 */
export const BattlePreview = memo(({
  selectedArmy,
  battleTarget,
  getTerritoryColor,
  calculateBattleOdds,
  onCancel,
  onStartBattle,
  isMobile = false
}: BattlePreviewProps) => {
  // Get defender size
  const defenderSize = useMemo(() => {
    if (battleTarget.army) {
      return Number(battleTarget.army.size)
    }
    // If attacking territory without army, it's an empty capture
    return 0
  }, [battleTarget])

  const attackerSize = Number(selectedArmy.size)

  // Calculate deterministic battle result
  const battleResult = useMemo(() => {
    return calculateBattleResult(attackerSize, defenderSize)
  }, [attackerSize, defenderSize])

  // Calculate minimum units needed to win
  const minUnitsToWin = defenderSize + 1

  return (
    <div className="space-y-4">
      {/* Battle Header */}
      <div className="text-center">
        <Sword className="w-6 h-6 mx-auto text-red-400 mb-1" />
        <h3 className="font-bold text-lg">Battle Preview</h3>
      </div>

      {/* Forces Comparison */}
      <div className="bg-surface-3/50 rounded-lg p-3 space-y-3">
        {/* Attacker */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Your Army</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${Math.min(100, (attackerSize / Math.max(attackerSize, defenderSize)) * 100)}%` }}
              />
            </div>
            <Badge className="bg-green-600 text-white font-bold min-w-[3rem] justify-center">
              {attackerSize}
            </Badge>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted font-medium">VS</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Defender */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {battleTarget.army ? "Enemy Army" : "Territory Defense"}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${Math.min(100, (defenderSize / Math.max(attackerSize, defenderSize || 1)) * 100)}%` }}
              />
            </div>
            <Badge className="bg-red-600 text-white font-bold min-w-[3rem] justify-center">
              {defenderSize}
            </Badge>
          </div>
        </div>
      </div>

      {/* Battle Outcome - DETERMINISTIC */}
      <div
        className={`rounded-lg p-4 border-2 ${
          battleResult.outcome === "win"
            ? "bg-green-900/30 border-green-500"
            : battleResult.outcome === "lose"
            ? "bg-red-900/30 border-red-500"
            : "bg-orange-900/30 border-orange-500 animate-pulse"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {battleResult.outcome === "win" && (
            <>
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-lg font-bold text-green-400">YOU WILL WIN</span>
            </>
          )}
          {battleResult.outcome === "lose" && (
            <>
              <XCircle className="w-6 h-6 text-red-400" />
              <span className="text-lg font-bold text-red-400">YOU WILL LOSE</span>
            </>
          )}
          {battleResult.outcome === "tie" && (
            <>
              <Skull className="w-6 h-6 text-orange-400" />
              <span className="text-lg font-bold text-orange-400">TIE - BOTH DIE!</span>
            </>
          )}
        </div>

        {/* Outcome Details */}
        <div className="text-center text-sm">
          {battleResult.outcome === "win" && (
            <p className="text-green-300">
              <span className="font-bold">{battleResult.survivors}</span> units will survive and capture the territory
            </p>
          )}
          {battleResult.outcome === "lose" && (
            <p className="text-red-300">
              Your army will be destroyed. Enemy keeps <span className="font-bold">{battleResult.survivors}</span> units
            </p>
          )}
          {battleResult.outcome === "tie" && (
            <div className="space-y-2">
              <p className="text-orange-300 font-medium">
                Both armies will be completely destroyed!
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-300 bg-yellow-900/30 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">This is a terrible trade!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestion for Tie */}
      {battleResult.outcome === "tie" && (
        <div className="flex items-center gap-2 p-3 bg-blue-900/30 rounded-lg border border-blue-500/50">
          <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-300">
            Send <span className="font-bold text-blue-200">{minUnitsToWin}+</span> units to win instead!
          </p>
        </div>
      )}

      {/* After Battle Summary */}
      {battleResult.outcome !== "tie" && defenderSize > 0 && (
        <div className="text-xs text-text-secondary bg-surface-3/30 rounded-lg p-2">
          <p className="font-medium mb-1">After battle:</p>
          <ul className="space-y-0.5">
            <li>
              • Source territory: {Math.max(0, attackerSize - attackerSize)} units remain
              {battleResult.outcome === "win" && " (sent all to attack)"}
            </li>
            {battleResult.outcome === "win" && (
              <li>• Captured territory: {battleResult.survivors} units</li>
            )}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <Button
          variant="outline"
          className={`${isMobile ? 'h-12 text-base' : ''} text-black`}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className={`${isMobile ? 'h-12 text-base' : ''} ${
            battleResult.outcome === "tie"
              ? "bg-orange-600 hover:bg-orange-700"
              : battleResult.outcome === "lose"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
          onClick={onStartBattle}
        >
          <Sword className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
          {battleResult.outcome === "tie" ? (
            <>
              <Skull className="w-4 h-4 mr-1" />
              Attack Anyway
            </>
          ) : battleResult.outcome === "lose" ? (
            "Attack (Lose)"
          ) : defenderSize === 0 ? (
            "Capture Territory"
          ) : (
            "Attack!"
          )}
        </Button>
      </div>
    </div>
  )
})

BattlePreview.displayName = "BattlePreview"
