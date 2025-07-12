import { CheckCircle, Copy, XCircle } from "lucide-react";
import { PlayerState } from "@/lib/types/gameStatus";
import { Button } from "@/components/ui/button";


interface PlayerListProps {
    players: PlayerState[];
    currentPlayer: string;
}

const PlayerList = ({ players, currentPlayer }: PlayerListProps) => {
    const sliceAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    if (players.length === 0) {
        return <p className="text-sm text-muted-foreground">Waiting for players...</p>;
    }

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address)
    }

    return (
        <div className="grid gap-2">
            {players.map((player, index) => (
                <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-md ${player.address.toLowerCase() === currentPlayer.toLowerCase()
                        ? 'bg-primary/20 border border-primary'
                        : 'bg-muted'
                        }`}
                >
                    <span className="text-sm font-medium">
                        {player.address.toLowerCase() === currentPlayer.toLowerCase() && '👉 '}
                        Player {index + 1}: {sliceAddress(player.address)}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                        onClick={() => copyAddress(player.address)}
                    >
                        <Copy className="w-3 h-3" />
                    </Button>
                    {player.roundSubmitted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default PlayerList;