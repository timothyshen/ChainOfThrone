'use client'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { PlayerRank } from '@/lib/types/setup'
import CreateNewGame from "./CreateNewGame"

const mockPlayers: PlayerRank[] = [
    { id: '1', walletAddress: '0x1234567890123456789012345678901234567890', wins: 15 },
    { id: '2', walletAddress: '0xabcdef0123456789abcdef0123456789abcdef01', wins: 12 },
    { id: '3', walletAddress: '0x2345678901234567890123456789012345678901', wins: 10 },
    { id: '4', walletAddress: '0x3456789012345678901234567890123456789012', wins: 9 },
    { id: '5', walletAddress: '0x4567890123456789012345678901234567890123', wins: 8 },
    { id: '6', walletAddress: '0x5678901234567890123456789012345678901234', wins: 7 },
    { id: '7', walletAddress: '0x6789012345678901234567890123456789012345', wins: 6 },
    { id: '8', walletAddress: '0x7890123456789012345678901234567890123456', wins: 5 },
    { id: '9', walletAddress: '0x8901234567890123456789012345678901234567', wins: 4 },
    { id: '10', walletAddress: '0x9012345678901234567890123456789012345678', wins: 3 },
    { id: '11', walletAddress: '0xa123456789012345678901234567890123456789', wins: 2 },
    { id: '12', walletAddress: '0xb234567890123456789012345678901234567890', wins: 1 },
]

function RankingBoard() {
    const [players, setPlayers] = useState<PlayerRank[]>(mockPlayers)

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Game Actions & Rankings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <CreateNewGame />
                <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <h3 className="text-lg font-semibold mb-2">Top 10 Players</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Wallet Address</TableHead>
                                <TableHead>Wins</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {players
                                .sort((a, b) => b.wins - a.wins)
                                .slice(0, 10)
                                .map((player, index) => (
                                    <TableRow key={player.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{truncateAddress(player.walletAddress)}</TableCell>
                                        <TableCell>{player.wins}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

export default RankingBoard;