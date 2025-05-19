'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy } from "lucide-react"
import { useGameHistory } from "@/lib/hooks/useGameHistory"

function RankingBoard() {
    // const { playerRanks } = useGameHistory()

    const playerRanks = [
        {
            address: "0x1234567890123456789012345678901234567890",
            wins: 10,
            winRate: 90
        },
        {
            address: "0x1234567890123456789012345678901234567890",
            wins: 9,
            winRate: 90
        },
        {
            address: "0x1234567890123456789012345678901234567890",
            wins: 15,
            winRate: 70
        },
    ]

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <Card className="flex-1 flex flex-col backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top 10 Warriors
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-gray-400">Rank</TableHead>
                            <TableHead className="text-gray-400">Warrior</TableHead>
                            <TableHead className="text-gray-400 text-right">Wins</TableHead>
                            <TableHead className="text-gray-400 text-right">Win Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {playerRanks.slice(0, 10).map((player, i) => (
                            <TableRow key={i} className="border-gray-800">
                                <TableCell className="font-bold">{i + 1}</TableCell>
                                <TableCell className="font-mono text-gray-300">{truncateAddress(player.address)}</TableCell>
                                <TableCell className="text-right">{player.wins}</TableCell>
                                <TableCell className="text-right">{player.winRate}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default RankingBoard;