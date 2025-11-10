import { memo } from "react"
import { Button } from "@/components/ui/button"

type GameResultType = "win" | "loss"

interface ModalActionsProps {
  type: GameResultType
  onClose: () => void
  onNewGame: () => void
}

/**
 * ModalActions Component
 *
 * Footer actions for game completion modal
 * Shows contextual buttons based on win/loss state
 */
export const ModalActions = memo(({ type, onClose, onNewGame }: ModalActionsProps) => {
  if (type === "win") {
    return (
      <>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-2">
          Would you like to start a new game of diplomacy?
        </p>

        <div className="flex gap-3 justify-center w-full">
          <Button variant="outline" onClick={onClose} className="px-6">
            Close
          </Button>
          <Button
            className="px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={onNewGame}
          >
            New Game
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-2">
        Would you like to try another diplomatic strategy?
      </p>

      <div className="flex gap-3 justify-center w-full">
        <Button variant="outline" onClick={onClose} className="px-6">
          Exit
        </Button>
        <Button
          className="px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          onClick={onNewGame}
        >
          New Game
        </Button>
      </div>
    </>
  )
})

ModalActions.displayName = "ModalActions"
