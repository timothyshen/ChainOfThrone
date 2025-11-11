"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, CheckCircle, XCircle, Users, Clock, Copy } from 'lucide-react';
import { toast } from "@/lib/hooks/use-toast";
import { truncateAddress } from "@/lib/utils";
import { GameStatusEnum, PlayerState, GameStatusProps } from "@/lib/types/gameStatus";
import { getGameStatus, totalPlayers, getWinner } from "@/lib/hooks/ReadGameContract";
import { useAddPlayer } from "@/lib/hooks/useAddPlayer";
import { useTransaction } from "@/lib/hooks/useTransaction";
import { useTransactionToast } from "@/lib/hooks/useTransactionToast";
import { useGameAddress } from '@/lib/hooks/useGameAddress';
import { DiplomacyResultModal } from "../GameCompleteModal";
import { TransactionButton } from "@/components/shared/TransactionButton";
import { useWatchContractEvent } from "wagmi"
import { gameAbi } from '@/lib/contract/gameAbi'

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
    if (players.length === 0) {
        return <p className="text-sm text-muted-foreground">Waiting for players...</p>;
    }

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address)
    }

    const getPlayerColor = (playerAddress: string) => {
        return playerAddress.toLowerCase() === currentPlayer.toLowerCase()
            ? 'bg-blue-500'
            : 'bg-red-500'
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
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPlayerColor(player.address)}`} />
                        <span className="text-sm font-medium">
                            {player.address.toLowerCase() === currentPlayer.toLowerCase() && '👉 '}
                            Player {index + 1}: {truncateAddress(player.address)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                </div>
            ))}
        </div>
    );
};

export default function GameStatus({ isLoading, currentPlayer, gameStatus, totalPlayer, maxPlayer, playerAddresses, setGameStatus, setTotalPlayer, fetchGameData }: GameStatusProps) {
    const { gameAddress } = useGameAddress();
    const { addPlayer } = useAddPlayer();
    const tx = useTransaction();
    const [showCompleteModal, setShowCompleteModal] = useState(true);
    const [winer, setWinner] = useState(String)

    // Automatically display transaction status notifications
    useTransactionToast(tx.state, {
        success: "You have successfully joined the game!",
        error: "Failed to join game"
    })

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

    // Refresh game data after transaction success
    useEffect(() => {
        if (tx.isSuccess) {
            fetchGameData();
        }
    }, [tx.isSuccess, fetchGameData]);



    useWatchContractEvent({
        address: gameAddress as `0x${string}` | undefined,
        abi: gameAbi,
        eventName: "PlayerAdded",
        onLogs: () => {
            fetchGameData();
        }
    })

    useWatchContractEvent({
        address: gameAddress as `0x${string}` | undefined,
        abi: gameAbi,
        eventName: "GameStarted",
        onLogs: () => {
            fetchGameData();
        }
    })

    useWatchContractEvent({
        address: gameAddress as `0x${string}` | undefined,
        abi: gameAbi,
        eventName: "MoveSubmitted",
        onLogs: () => {
            fetchGameData();
        }
    })

    const handlePlayerJoin = async () => {
        if (!gameAddress) return;

        try {
            // Execute transaction and wait for confirmation
            await tx.execute(() => addPlayer(gameAddress));

            // After transaction is confirmed, update game state
            const [status, total] = await Promise.all([
                getGameStatus(gameAddress),
                totalPlayers(gameAddress)
            ]);

            setGameStatus(getGameStatusText(status as number));
            setTotalPlayer(total as number);

        } catch (error) {
            // Error already displayed via useTransactionToast
            console.error("Failed to join game:", error);
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

    // TODO: need two progress bars, one for player progress and one for round progress

    return (
        <div className="w-full">
            <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Players</p>
                                    <p className="text-lg font-semibold">
                                        {totalPlayer} / {maxPlayer}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground ">Status</p>
                                    <Badge className={`${getStatusColor(gameStatus)} text-white w-max`}>
                                        {gameStatus}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Players
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {playerAddresses.length > 0 ? (
                            <PlayerList players={playerAddresses} currentPlayer={currentPlayer} />
                        ) : (
                            <div className="text-center py-4">
                                <UserPlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Waiting for players to join...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {totalPlayer === maxPlayer ? (
                    <Button disabled className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Game is full
                    </Button>
                ) : (
                    <TransactionButton
                        state={tx.state}
                        onClick={handlePlayerJoin}
                        idleText={
                            <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Join Game
                            </>
                        }
                        signingText="Sign in Wallet"
                        submittedText={
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Joining...
                            </>
                        }
                        confirmingText={
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Confirming...
                            </>
                        }
                        successText="✓ Joined!"
                        errorText="Try Again"
                        className="w-full"
                    />
                )}
            </div>

            {
                gameAddress && (
                    <DiplomacyResultModal
                        gameAddress={gameAddress}
                        type="win"
                        open={false}
                        onOpenChange={setShowCompleteModal}
                        year="Fall, 1908"
                        stats={winStats}
                    />
                )
            }
        </div >
    )
}

