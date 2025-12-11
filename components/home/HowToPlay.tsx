import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Crown, Swords, MapPin, Target, Coins } from "lucide-react"

interface HowToPlayDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Standalone dialog component for "How to Play"
 * Can be used from any page (home, game, etc.)
 */
export function HowToPlayDialog({ open, onOpenChange }: HowToPlayDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <HowToPlayContent />
        </Dialog>
    )
}

/**
 * Content-only component for embedding in other dialogs
 */
export function HowToPlayContent() {
    return (
        <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-game-castle" />
                    How to Play Chain of Thrones
                </DialogTitle>
                <DialogDescription>
                    Master the battlefield and claim victory
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-5">
                {/* Win Condition - Most Important */}
                <section className="p-4 bg-game-castle/10 rounded-lg border border-game-castle/30">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-game-castle" />
                        Win Condition
                    </h3>
                    <p className="text-foreground font-medium">
                        Control 3 of 5 castles to win the game!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Castles are marked in amber/gold on the map at the four corners and center.
                    </p>
                </section>

                {/* Game Setup */}
                <section>
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                        <Coins className="h-4 w-4 text-emerald-500" />
                        Stakes & Setup
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            2 players compete on a 3x3 grid
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Each player stakes 1 MONAD to join
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Winner takes 90% of the pool (1.8 MONAD)
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Each player starts with 10 army units
                        </li>
                    </ul>
                </section>

                {/* Movement */}
                <section>
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-game-player" />
                        Movement
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Tap your army to select it
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Move to adjacent cells only (up/down/left/right)
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            <span className="text-emerald-500">Green cells</span> = valid moves
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            <span className="text-red-500">Red cells</span> = attack enemy
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            One move per turn, then wait for opponent
                        </li>
                    </ul>
                </section>

                {/* Combat */}
                <section>
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                        <Swords className="h-4 w-4 text-game-enemy" />
                        Combat
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Larger army wins when units clash
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Surviving units = winner size - loser size
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            <strong>Castle defense bonus:</strong> 2.5x multiplier!
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-foreground">&#8226;</span>
                            Plan attacks carefully - defenders have advantage
                        </li>
                    </ul>
                </section>

                {/* Quick Tips */}
                <section className="p-3 bg-surface-2 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2">Quick Tips</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>&#128161; Control the center castle - it borders all other cells</li>
                        <li>&#128161; Defend your castles - the 2.5x bonus is powerful</li>
                        <li>&#128161; Split your army strategically to control multiple castles</li>
                    </ul>
                </section>
            </div>
        </DialogContent>
    )
}

export default HowToPlayContent