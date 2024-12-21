import { CheckCircle, XCircle } from "lucide-react";
import { PlayerState } from "@/lib/types/gameStatus";


interface PlayerListProps {
    players: PlayerState[];
    currentPlayer: string;
}

const PlayerList = ({ players, currentPlayer }: PlayerListProps) => {
    const sliceAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    if (players.length === 0) {
        return <p className="text-sm text-muted-foreground">Waiting for players...</p>;
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