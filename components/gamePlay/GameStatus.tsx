"use client";
import { useState, useEffect } from "react";
import { Player } from '@/lib/types/game'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGameStatus, totalPlayers, idToAddress } from "@/lib/hooks/ReadContract";
import { useAddPlayer } from "@/lib/hooks/useAddPlayer";
import { Button } from "@/components/ui/button";

interface GameStatusProps {
    currentPlayer: Player | null
    players: Player[]
}

export default function GameStatus({ currentPlayer, players }: GameStatusProps) {


    const [gameStatus, setGameStatus] = useState(null);
    const [totalPlayer, setTotalPlayer] = useState();
    const { addPlayer, isLoading, error } = useAddPlayer();

    useEffect(() => {
        const getGameStatus = async () => {
            const status = await getGameStatus();
            console.log("gameStatus", status);
        };

        const getTotalPlayers = async () => {
            const total = await totalPlayers();
            console.log("totalPlayers", total);
        };

        const getPlayerAddress = async () => {
            const address = await idToAddress(0);
            console.log("playerAddress", address);
        };

        getGameStatus();
        getTotalPlayers();
        getPlayerAddress();
    }, []);

    const handlePlayerJoin = async () => {
        const result = await addPlayer();
        console.log(result);
    };

    const getWinningPlayer = () => {
        const [player1, player2] = players
        if (!player1 || !player2) return null
        if (player1.supplyCenters > player2.supplyCenters) {
            return player1
        } else if (player2.supplyCenters > player1.supplyCenters) {
            return player2
        }
        return null
    }

    const winningPlayer = getWinningPlayer()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Game Status</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Current Player: {currentPlayer?.name}</p>
                <p>Player 1: {players[0]?.isReady ? 'Ready' : 'Not Ready'} (Supply Centers: {players[0]?.supplyCenters})</p>
                <p>Player 2: {players[1]?.isReady ? 'Ready' : 'Not Ready'} (Supply Centers: {players[1]?.supplyCenters})</p>
                {winningPlayer ? (
                    <p className="font-bold mt-2">Current Leader: {winningPlayer.name}</p>
                ) : (
                    <p className="font-bold mt-2">Game is currently tied</p>
                )}
                <Button onClick={handlePlayerJoin}>Join Game</Button>
            </CardContent>
        </Card>
    )
} 