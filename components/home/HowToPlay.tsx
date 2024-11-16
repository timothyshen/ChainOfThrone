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
                maxPlayer
            </div>
        </DialogContent>
    )
}

export default HowToPlay