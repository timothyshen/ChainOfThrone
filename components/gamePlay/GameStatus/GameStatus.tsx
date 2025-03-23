"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "@/lib/hooks/use-toast";
import { GameStatusEnum, PlayerState, GameStatusProps } from "@/lib/types/gameStatus";
import { getGameStatus, totalPlayers, getWinner } from "@/lib/hooks/ReadGameContract";
import { useAddPlayer } from "@/lib/hooks/useAddPlayer";
import { useGameAddress } from '@/lib/hooks/useGameAddress';
import { useGameStateUpdates } from "@/lib/hooks/useGameStateUpdates";
import { DiplomacyResultModal } from "../GameCompleteModal";
import { Spinner } from "@/components/ui/spinner";

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

const winStats = {
    supplyCenters: 18,
    territories: 22,
    alliances: 4,
    totalYears: 7,
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

export default function GameStatus({ isLoading, currentPlayer, gameStatus, totalPlayer, maxPlayer, playerAddresses, setGameStatus, setTotalPlayer, fetchGameData }: GameStatusProps) {
    const { gameAddress } = useGameAddress();
    const { addPlayer, isPending, isConfirming, error, isConfirmed } = useAddPlayer();
    const [showCompleteModal, setShowCompleteModal] = useState(true);
    const [winer, setWinner] = useState(String)

    useEffect(() => {
        async function checkWinner() {
            if (gameStatus === GameStatusEnum.COMPLETED) {
                setShowCompleteModal(true);
                if (!gameAddress) return null;
                const winnerAddress = await getWinner(gameAddress);
                if (winnerAddress === currentPlayer) {
                    setWinner(currentPlayer);
                }
            }
        }
        checkWinner();
    }, [gameStatus, gameAddress, currentPlayer]);

    useEffect(() => {
        if (isConfirming) {
            toast({
                title: "Joining Game",
                description: (
                    <div className="flex items-center">
                        <Spinner className="mr-2" />
                        Joining game...
                    </div>
                ),
            })
        }
    }, [isConfirming]);

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Joined Game",
                description: "You have successfully joined the game",
            });
            fetchGameData();
        }

    }, [fetchGameData, isConfirmed]);

    const handlePlayerJoin = async () => {
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

    const handleCloseModal = () => {
        setShowCompleteModal(false);
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

    // TODO: need two progress bars, one for player progress and one for round progress

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
                        <p className="text-sm font-medium text-muted-foreground ">Game Status</p>
                        <Badge className={`${getStatusColor(gameStatus)} text-white w-max`}>
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

            {gameAddress && (
                <DiplomacyResultModal
                    gameAddress={gameAddress}
                    type="win"
                    open={false}
                    onOpenChange={setShowCompleteModal}
                    power="Great Britain"
                    year="Fall, 1908"
                    stats={winStats}
                />
            )}
        </Card>
    )
}

