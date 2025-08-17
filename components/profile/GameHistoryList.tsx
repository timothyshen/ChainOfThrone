'use client'

import { GameHistory } from '@/lib/types/setup'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Clock, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface GameHistoryListProps {
    games: GameHistory[]
    isLoading: boolean
    userAddress: `0x${string}`
}

export default function GameHistoryList({ games, isLoading, userAddress }: GameHistoryListProps) {
    // Helper function to format timestamps
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Helper to format time ago
    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now()
        const secondsAgo = Math.floor((now - timestamp) / 1000)

        if (secondsAgo < 60) return `${secondsAgo} seconds ago`
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`
        if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`
        if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 86400)} days ago`

        return formatDate(timestamp)
    }

    // Helper to slice address for display
    const sliceAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    if (isLoading) {
        return (
            <div className={cn("flex flex-col space-y-4 animate-pulse")}>
                <div className={cn("h-10 bg-muted rounded-lg")}></div>
                <div className={cn("h-10 bg-muted rounded-lg")}></div>
                <div className={cn("h-10 bg-muted rounded-lg")}></div>
            </div>
        )
    }

    if (games.length === 0) {
        return (
            <div className={cn("text-center py-8")}>
                <h3 className={cn("text-lg font-medium")}>No games yet</h3>
                <p className={cn("text-muted-foreground mt-2")}>You haven&apos;t played any games yet.</p>
                <Button className={cn("mt-4")}>
                    <Link href="/explore">Find Games</Link>
                </Button>
            </div>
        )
    }

    return (
        <ScrollArea className={cn("h-[400px]")}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="hidden md:table-cell">Players</TableHead>
                        <TableHead className="hidden md:table-cell">Rounds</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {games.map((game) => {
                        const isWinner = game.winner === userAddress
                        return (
                            <TableRow key={game.gameAddress}>
                                <TableCell>
                                    <div className={cn("flex flex-col")}>
                                        <span className={cn("text-sm font-medium")}>{formatDate(game.timestamp)}</span>
                                        <span className={cn("text-xs text-muted-foreground flex items-center")}>
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatTimeAgo(game.timestamp)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn("flex items-center")}>
                                        {isWinner ? (
                                            <span className={cn("text-sm font-medium flex items-center text-amber-500")}>
                                                <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                                                Win
                                            </span>
                                        ) : (
                                            <span className={cn("text-sm text-muted-foreground")}>Loss</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className={cn("flex items-center")}>
                                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className={cn("text-sm")}>{game.players.length}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <span className={cn("text-sm")}>{game.totalRounds}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/game/${game.gameAddress}`}>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </ScrollArea>
    )
} 