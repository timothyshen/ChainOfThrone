import { memo } from "react"
import { Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MovementModeProps } from "@/lib/types/gameOperationPanel"

/**
 * MovementMode Component
 *
 * Displays active movement mode indicator with cancel option
 */
export const MovementMode = memo(({ onCancel, isMobile = false }: MovementModeProps) => (
  <div className="space-y-2">
    <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="w-4 h-4 text-green-400" />
        <span className="text-green-400 font-semibold">Movement Mode Active</span>
      </div>
      <p className="text-sm text-green-300">
        Click on a highlighted cell to move your army there.
      </p>
    </div>
    <Button
      variant="outline"
      className={`w-full text-black ${isMobile ? 'h-12 text-base' : ''}`}
      onClick={onCancel}
    >
      Cancel Movement
    </Button>
  </div>
))

MovementMode.displayName = "MovementMode"
