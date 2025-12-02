"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, UserPlus, Copy } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { PlayerState } from "@/lib/types/gameStatus";
import { useToast } from "@/lib/hooks/use-toast";

interface PlayerListCardProps {
  players: PlayerState[];
  currentPlayer: string;
}

interface PlayerItemProps {
  player: PlayerState;
  index: number;
  currentPlayer: string;
  onCopyAddress: (address: string) => void;
}

function PlayerItem({
  player,
  index,
  currentPlayer,
  onCopyAddress,
}: PlayerItemProps) {
  const isCurrentPlayer =
    player.address.toLowerCase() === currentPlayer.toLowerCase();
  const playerColor = isCurrentPlayer ? "bg-blue-500" : "bg-red-500";

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md ${
        isCurrentPlayer ? "bg-primary/20 border border-primary" : "bg-muted"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${playerColor}`} />
        <span className="text-sm font-medium">
          {isCurrentPlayer && "👉 "}
          Player {index + 1}: {truncateAddress(player.address)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200"
          onClick={() => onCopyAddress(player.address)}
          aria-label={`Copy ${player.address}`}
        >
          <Copy className="w-3 h-3" />
        </Button>
        {player.roundSubmitted ? (
          <CheckCircle
            className="h-5 w-5 text-green-500"
            aria-label="Round submitted"
          />
        ) : (
          <XCircle
            className="h-5 w-5 text-red-500"
            aria-label="Round not submitted"
          />
        )}
      </div>
    </div>
  );
}

export function PlayerListCard({ players, currentPlayer }: PlayerListCardProps) {
  const { toast } = useToast();

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length > 0 ? (
          <div className="grid gap-2">
            {players.map((player, index) => (
              <PlayerItem
                key={player.address}
                player={player}
                index={index}
                currentPlayer={currentPlayer}
                onCopyAddress={copyAddress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <UserPlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Waiting for players to join...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
