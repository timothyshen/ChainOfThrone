"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "@/lib/hooks/use-toast";
import { GameStatusEnum, PlayerState, GameStatusProps } from "@/lib/types/gameStatus";
import { getGameStatus, totalPlayers, idToAddress, getMaxPlayer, getRoundSubmitted } from "@/lib/hooks/ReadGameContract";
import { useAddPlayer } from "@/lib/hooks/useAddPlayer";

const getGameStatusText = (status: number): GameStatusEnum => {
    switch (status) {
        case 0:
            return GameStatusEnum.NOT_STARTED;
        case 1:
            return GameStatusEnum.ONGOING;
        case 2:
            return GameStatusEnum.COMPLETED;
        default:
            return GameStatusEnum.NOT_STARTED;
    }
}

const PlayerList = ({ players, currentPlayer }: { players: PlayerState[], currentPlayer: string }) => {
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

export default function GameStatus({ currentPlayer, players }: GameStatusProps) {
    const [gameStatus, setGameStatus] = useState<GameStatusEnum>(GameStatusEnum.NOT_STARTED);
    const [totalPlayer, setTotalPlayer] = useState<number>(0);
    const [maxPlayer, setMaxPlayer] = useState<number>(0);
    const [playerAddresses, setPlayerAddresses] = useState<PlayerState[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addPlayer, isPending, error, isConfirmed } = useAddPlayer();

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const gameAddress = localStorage.getItem("gameAddress") as `0x${string}`;
                if (!gameAddress) return;

                const [status, total, max] = await Promise.all([
                    getGameStatus(gameAddress),
                    totalPlayers(gameAddress),
                    getMaxPlayer(gameAddress)
                ]);

                setGameStatus(getGameStatusText(status as number));
                setTotalPlayer(total as number);
                setMaxPlayer(max as number);

                if (total as number > 0) {
                    const addresses = await Promise.all(
                        Array.from({ length: 2 }, (_, i) =>
                            Promise.all([
                                idToAddress(gameAddress, i),
                                getRoundSubmitted(gameAddress, i)
                            ])
                        )
                    );

                    setPlayerAddresses(addresses.map(([address, roundSubmitted]) => ({
                        address: address as string,
                        roundSubmitted: roundSubmitted as boolean
                    })));
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch game data",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, []);

    const handlePlayerJoin = async () => {
        const gameAddress = localStorage.getItem("gameAddress") as `0x${string}`;
        if (!gameAddress) return;

        try {
            await addPlayer(gameAddress);

            if (isConfirmed) {
                const [status, total] = await Promise.all([
                    getGameStatus(gameAddress),
                    totalPlayers(gameAddress)
                ]);

                setGameStatus(getGameStatusText(status as number));
                setTotalPlayer(total as number);

                toast({
                    title: "Joined game",
                    description: "You have successfully joined the game",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to join game",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: GameStatusEnum) => {
        switch (status) {
            case GameStatusEnum.NOT_STARTED:
                return "bg-yellow-500";
            case GameStatusEnum.ONGOING:
                return "bg-green-500";
            case GameStatusEnum.COMPLETED:
                return "bg-blue-500";
            default:
                return "bg-gray-500";
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Game Status</CardTitle>
                <CardDescription>Current game information and player status</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Players</p>
                        <p className="text-2xl font-bold">{totalPlayer} / {maxPlayer}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Game Status</p>
                        <Badge className={`${getStatusColor(gameStatus)} text-white`}>
                            {gameStatus}
                        </Badge>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Player Progress</p>
                    <Progress value={(totalPlayer / maxPlayer) * 100} className="w-full" />
                </div>

                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Players</p>
                    <PlayerList players={playerAddresses} currentPlayer={currentPlayer} />
                </div>

                <Button
                    onClick={handlePlayerJoin}
                    disabled={isPending || totalPlayer === maxPlayer}
                    className="w-full"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Joining...
                        </>
                    ) : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Join Game
                        </>
                    )}
                </Button>

                {totalPlayer === maxPlayer && (
                    <p className="text-sm text-center text-muted-foreground">Game is full</p>
                )}
                {error && (
                    <p className="text-sm text-center text-red-500">Error: {error.message}</p>
                )}
            </CardContent>
        </Card>
    )
}

