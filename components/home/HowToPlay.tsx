import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

function HowToPlay() {
    return (
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>How to Play Diplomacy</DialogTitle>
                <DialogDescription>
                    Learn the rules and strategies of the game
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-6">
                {/* Introduction */}
                <section>
                    <h3 className="text-lg font-semibold mb-2">Rationale</h3>
                    <p className="text-muted-foreground">
                        An onchain geopolitics game built as a simplified version for this hackathon, 
                        featuring fully autonomous AI gameplay.
                    </p>
                </section>

                {/* Game Objective */}
                <section>
                    <h3 className="text-lg font-semibold mb-2">Goal</h3>
                    <p className="text-muted-foreground">
                        Control 3 out of 5 castles to win. Castles are located in yellow areas.
                    </p>
                </section>

                {/* Game Setup */}
                <section>
                    <h3 className="text-lg font-semibold mb-2">Opening Phase</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li>2-3 players can participate</li>
                        <li>2 players must start in predefined positions</li>
                        <li>3 players have specific starting positions</li>
                        <li>Each player must stake 10 USDC as 10 armies</li>
                    </ul>
                </section>

                {/* Gameplay */}
                <section>
                    <h3 className="text-lg font-semibold mb-2">Execution Phase</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-1">Movement</h4>
                            <ul className="list-disc list-inside text-muted-foreground">
                                <li>Move 0-10 armies in one direction (left, right, up, down)</li>
                                <li>Only one move allowed per turn</li>
                                <li>Each castle must maintain at least 1 army</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium mb-1">Loans</h4>
                            <p className="text-muted-foreground">
                                Players can negotiate army loans with other players, which must be repaid in the next round.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Resolution */}
                <section>
                    <h3 className="text-lg font-semibold mb-2">Resolution Phase</h3>
                    <div className="space-y-2 text-muted-foreground">
                        <p className="font-medium">Conflict Resolution:</p>
                        <ul className="list-disc list-inside pl-4">
                            <li>Largest USDC army wins when multiple units move to same space</li>
                            <li>2 players: winner armies = larger - smaller</li>
                            <li>3 players: winner armies = largest - second largest</li>
                        </ul>
                    </div>
                </section>

                {/* Future Plans */}
                <section>
                    <h3 className="text-lg font-semibold mb-2">Future Development</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                        <li>Add financial incentives</li>
                        <li>Implement prediction markets</li>
                        <li>Enable AI bot training capabilities</li>
                    </ul>
                </section>
            </div>
        </DialogContent>
    )
}

export default HowToPlay