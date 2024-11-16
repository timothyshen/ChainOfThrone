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
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Game Overview</h3>
                <p className="mb-4">
                    Diplomacy is a strategic board game set in Europe just before the outbreak of World War I.
                    Players represent one of the seven Great Powers of Europe and try to gain supply centers and become the dominant power.
                </p>

                <h3 className="text-lg font-semibold mb-2">Basic Rules</h3>
                <ol className="list-decimal list-inside mb-4">
                    <li>The game is played on a map of Europe divided into provinces.</li>
                    <li>Each player controls armies and fleets, trying to capture supply centers.</li>
                    <li>Orders are written secretly and revealed simultaneously.</li>
                    <li>Players can negotiate and form alliances, but these are not binding.</li>
                    <li>The game is won by controlling 18 supply centers.</li>
                </ol>

                <h3 className="text-lg font-semibold mb-2">Turn Structure</h3>
                <ol className="list-decimal list-inside mb-4">
                    <li>Spring Move: Players write orders for all their units.</li>
                    <li>Spring Retreat: Units that were dislodged must retreat or be disbanded.</li>
                    <li>Fall Move: Another round of movement orders.</li>
                    <li>Fall Retreat: Another retreat phase if necessary.</li>
                    <li>Winter: Gain or lose units based on supply center control.</li>
                </ol>

                <h3 className="text-lg font-semibold mb-2">Types of Orders</h3>
                <ul className="list-disc list-inside mb-4">
                    <li>Move: Attempt to move a unit to an adjacent province.</li>
                    <li>Hold: Unit remains in place and defends against attacks.</li>
                    <li>Support: Increase the strength of another unit&apos;s order.</li>
                    <li>Convoy: Fleets can transport armies across sea spaces.</li>
                </ul>

                <p className="mb-4">
                    Remember, the key to success in Diplomacy is not just military strategy,
                    but also your ability to negotiate, form alliances, and sometimes, betray them at the right moment.
                </p>
            </div>
        </DialogContent>
    )
}

export default HowToPlay