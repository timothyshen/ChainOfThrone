import { memo, useMemo } from "react"
import { Navigation, ArrowRight, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { MovementInputProps } from "@/lib/types/gameOperationPanel"

/**
 * MovementInput Component
 *
 * Allows user to select number of units to move with:
 * - Visual slider control
 * - Quick select buttons (1, Half, All)
 * - Preview of army distribution after move
 */
export const MovementInput = memo(({
  selectedArmy,
  targetTerritory,
  moveStrength,
  animatingArmies,
  onMoveStrengthChange,
  onMoveArmy,
  isMobile = false
}: MovementInputProps) => {
  const maxUnits = Number(selectedArmy.size)
  const currentValue = moveStrength || 1

  // Calculate preview values
  const preview = useMemo(() => {
    return {
      sourceRemaining: maxUnits - currentValue,
      destinationUnits: currentValue,
    }
  }, [maxUnits, currentValue])

  // Quick select handlers
  const handleQuickSelect = (type: "one" | "half" | "all") => {
    switch (type) {
      case "one":
        onMoveStrengthChange(1)
        break
      case "half":
        onMoveStrengthChange(Math.ceil(maxUnits / 2))
        break
      case "all":
        onMoveStrengthChange(maxUnits)
        break
    }
  }

  const isMoving = selectedArmy && animatingArmies.has(selectedArmy.id)
  const canMove = currentValue > 0 && currentValue <= maxUnits && targetTerritory && !isMoving

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <Navigation className="w-6 h-6 mx-auto text-blue-400 mb-1" />
        <h3 className="font-bold text-lg">Move Army</h3>
      </div>

      {/* Target Territory */}
      {targetTerritory && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              Moving to <span className="font-bold">{targetTerritory.name}</span>
            </span>
          </div>
        </div>
      )}

      {/* Unit Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Units to send:</span>
          <span className="font-bold text-xl text-blue-400">{currentValue}</span>
        </div>

        {/* Slider */}
        <div className="px-1">
          <Slider
            value={[currentValue]}
            min={1}
            max={maxUnits}
            step={1}
            onValueChange={(value) => onMoveStrengthChange(value[0] ?? 1)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span>{maxUnits}</span>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 text-xs ${currentValue === 1 ? 'bg-blue-600 text-white border-blue-500' : 'text-black'}`}
            onClick={() => handleQuickSelect("one")}
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 text-xs ${currentValue === Math.ceil(maxUnits / 2) ? 'bg-blue-600 text-white border-blue-500' : 'text-black'}`}
            onClick={() => handleQuickSelect("half")}
          >
            Half ({Math.ceil(maxUnits / 2)})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 text-xs ${currentValue === maxUnits ? 'bg-blue-600 text-white border-blue-500' : 'text-black'}`}
            onClick={() => handleQuickSelect("all")}
          >
            All ({maxUnits})
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
        <p className="text-xs text-slate-400 font-medium">After move:</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-300">Source</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className={`text-sm font-bold ${preview.sourceRemaining === 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {preview.sourceRemaining} units
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-300">Destination</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-bold text-blue-400">
              {preview.destinationUnits} units
            </span>
          </div>
        </div>

        {preview.sourceRemaining === 0 && (
          <p className="text-[10px] text-yellow-400 text-center mt-2">
            Source territory will be empty after this move
          </p>
        )}
      </div>

      {/* Validation Messages */}
      {moveStrength > maxUnits && (
        <p className="text-red-500 text-xs text-center">
          Cannot exceed army size of {maxUnits}
        </p>
      )}

      {/* Move Button */}
      <Button
        className={`w-full ${isMobile ? 'h-12 text-base' : ''} bg-blue-600 hover:bg-blue-700 text-white`}
        disabled={!canMove}
        onClick={onMoveArmy}
      >
        <Navigation className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
        {isMoving ? "Moving..." : `Move ${currentValue} Unit${currentValue !== 1 ? 's' : ''}`}
      </Button>
    </div>
  )
})

MovementInput.displayName = "MovementInput"
