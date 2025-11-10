import { memo } from "react"
import { Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MovementInputProps } from "./types"

/**
 * MovementInput Component
 *
 * Allows user to input number of units to move and confirms the movement
 */
export const MovementInput = memo(({
  selectedArmy,
  targetTerritory,
  moveStrength,
  animatingArmies,
  onMoveStrengthChange,
  onMoveArmy,
  isMobile = false
}: MovementInputProps) => (
  <div className="grid grid-cols-1 gap-2">
    {targetTerritory && (
      <div className="bg-blue-200 border border-blue-600 rounded-lg p-2 mb-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">
            Moving to ({targetTerritory.x}, {targetTerritory.y})
          </span>
        </div>
      </div>
    )}
    <div className="space-y-1">
      <Input
        type="number"
        placeholder="Enter army number"
        className={`w-full text-black ${isMobile ? 'h-12 text-lg' : ''}`}
        maxLength={Number(selectedArmy.size)}
        onChange={(e) => {
          const value = parseInt(e.target.value)
          if (value >= 0 && value <= Number(selectedArmy.size)) {
            onMoveStrengthChange(value)
          }
        }}
      />
      {moveStrength > Number(selectedArmy.size) && (
        <p className="text-red-500 text-xs">
          Cannot exceed army size of {Number(selectedArmy.size)}
        </p>
      )}
      {moveStrength < 0 && (
        <p className="text-red-500 text-xs">Army size cannot be negative</p>
      )}
    </div>
    <Button
      variant="outline"
      className={`w-full text-black ${isMobile ? 'h-12 text-base' : ''}`}
      disabled={selectedArmy && animatingArmies.has(selectedArmy.id) || moveStrength <= 0 || !targetTerritory}
      onClick={onMoveArmy}
    >
      <Navigation className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
      {selectedArmy && animatingArmies.has(selectedArmy.id) ? "Moving..." : "Move Army"}
    </Button>
  </div>
))

MovementInput.displayName = "MovementInput"
