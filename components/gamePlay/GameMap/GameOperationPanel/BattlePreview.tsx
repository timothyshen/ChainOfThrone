import { memo } from "react"
import { Sword } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { BattlePreviewProps } from "./types"

/**
 * BattlePreview Component
 *
 * Shows battle preview with attacker/defender info and battle odds
 * Allows user to confirm or cancel the battle
 */
export const BattlePreview = memo(({
  selectedArmy,
  battleTarget,
  getTerritoryColor,
  calculateBattleOdds,
  onCancel,
  onStartBattle,
  isMobile = false
}: BattlePreviewProps) => (
  <div className="space-y-3">
    <div className="flex justify-between">
      <span>Attacker</span>
      <Badge style={{ backgroundColor: getTerritoryColor(selectedArmy.owner) }}>
        {selectedArmy.owner} ({Number(selectedArmy.size).toLocaleString()})
      </Badge>
    </div>

    {battleTarget.army ? (
      <div className="flex justify-between">
        <span>Defender</span>
        <Badge style={{ backgroundColor: getTerritoryColor(battleTarget.army.owner) }}>
          {battleTarget.army.owner} ({Number(battleTarget.army.size).toLocaleString()})
        </Badge>
      </div>
    ) : battleTarget.territory ? (
      <div className="flex justify-between">
        <span>Target</span>
        <Badge variant="secondary">
          Territory ({battleTarget.territory.x}, {battleTarget.territory.y})
        </Badge>
      </div>
    ) : null}

    <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
      <Button
        variant="outline"
        className={`${isMobile ? 'h-12 text-base' : ''} text-black`}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        className={`${isMobile ? 'h-12 text-base' : ''} bg-red-600 hover:bg-red-700 text-white`}
        onClick={onStartBattle}
      >
        <Sword className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
        Start Battle
      </Button>
    </div>
  </div>
))

BattlePreview.displayName = "BattlePreview"
