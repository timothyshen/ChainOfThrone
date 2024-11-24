"use client";
import { useState, useEffect } from "react";
import { Player } from '@/lib/types/game'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGameStatus, totalPlayers, idToAddress, getMaxPlayer } from "@/lib/hooks/ReadGameContract";
import { Button } from "@/components/ui/button";
import { useAddPlayer } from "@/lib/hooks/useAddPlayer";

interface GameStatusProps {
    currentPlayer: string
    players: Player[]
}

enum GameStatusEnum {
    NOT_STARTED = "Not Started",
    ONGOING = "Ongoing",
    COMPLETED = "Completed"
}

export default function GameStatus({ currentPlayer, players }: GameStatusProps) {


    const [gameStatus, setGameStatus] = useState(GameStatusEnum.NOT_STARTED);
    const [totalPlayer, setTotalPlayer] = useState<number>();
    const [maxPlayer, setMaxPlayer] = useState<number>();
    const [playerAddresses, setPlayerAddresses] = useState<string[]>([]);
    const { addPlayer, isPending, error } = useAddPlayer();

    useEffect(() => {
        const getGameStatuses = async () => {
            const status = await getGameStatus();
            console.log("gameStatus", status);
            setGameStatus(status as GameStatusEnum);
        };

        const getTotalPlayers = async () => {
            const total = await totalPlayers();
            console.log("totalPlayers", total);
            setTotalPlayer(total as number);
        };

        const getPlayerAddress = async () => {
            for (let i = 0; i < 2; i++) {
                const address = await idToAddress(i);
                console.log("playerAddress", address);
                // @ts-ignore
                setPlayerAddresses((prev: string[]) => [...prev, address]);
            }

        };

        const getMaxPlayerCount = async () => {
            const maxPlayers = await getMaxPlayer();
            console.log("maxPlayer", maxPlayers);
            setMaxPlayer(maxPlayers as number);
        };

        getGameStatuses();
        getTotalPlayers();
        getMaxPlayerCount();
        getPlayerAddress();
    }, []);

    const handlePlayerJoin = async () => {
        await addPlayer();
        const status = await getGameStatus();
        setGameStatus(status as GameStatusEnum);
        const total = await totalPlayers();
        setTotalPlayer(total as number);
    };
    if (isPending) {
        return <div>Transaction pending...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Game Status</CardTitle>
            </CardHeader>
            <CardContent>

                <p>Total Players: {totalPlayer} / {maxPlayer}</p>
                <p>Game Status: {gameStatus}</p>
                {/* if address is empty, then show "Waiting for players" */}
                {playerAddresses.length === 0 ? <p>Waiting for players</p> : playerAddresses.map((address, index) => (
                    <p key={index}>Player {index + 1}: {address}</p>
                ))}
                <Button
                    onClick={handlePlayerJoin}
                    disabled={isPending || totalPlayer === maxPlayer}

                >
                    {isPending ? 'Joining...' : 'Join Game'}
                </Button>
                {totalPlayer === maxPlayer && <p>Game is full</p>}
            </CardContent>
        </Card>
    )
} 