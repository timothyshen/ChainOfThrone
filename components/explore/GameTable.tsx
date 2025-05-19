'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/lib/hooks/use-toast"

// UI Components
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

// Icons
import { Info, Users, ArrowRight } from 'lucide-react'

// Types
import { Game } from "@/lib/types/setup"
import { cn } from '@/lib/utils'

export type GameStatus = 0 | 1 | 2
export type StatusFilter = 'all' | 'open' | 'in progress' | 'full'

interface GameTableProps {
    games: Game[]
    searchTerm: string
    statusFilter: StatusFilter
    onSelectGame: (game: Game) => void
}

// Utils
const STATUS_MAP: Record<GameStatus, string> = {
    0: "Open",
    1: "Progressing",
    2: "Completed"
}

const getStatusText = (status: number): string => STATUS_MAP[status as GameStatus] ?? "Unknown"

const getStatusStyles = (status: number): string => {
    const baseStyles = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium w-full justify-center"
    const statusStyles = {
        0: 'bg-white text-green-400 border border-green-400',
        1: 'bg-white text-yellow-400 border border-yellow-400',
        2: 'bg-white text-red-400 border border-red-400'
    }
    return `${baseStyles} ${statusStyles[status as GameStatus] ?? ''}`
}

export default function GameTable({ games, searchTerm, statusFilter, onSelectGame }: GameTableProps) {
    const router = useRouter()
    const { toast } = useToast()

    const handleJoinGame = async (gameAddress: string) => {
        try {
            localStorage.setItem("gameAddress", gameAddress)
            router.push(`/game/${gameAddress}`)
            toast({
                title: "Joining game",
                description: "Redirecting to game room...",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to join game",
                variant: "destructive",
            })
        }
    }

    const filteredGames = games.filter(game =>
        game.gameAddress.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || getStatusText(game.status).toLowerCase() === statusFilter)
    )

    // Desktop Table View
    const DesktopTable = () => (
        <ScrollArea className="h-[400px] pr-4">
            <Table>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead>Smart Contract</TableHead>
                        <TableHead className="text-center">Players</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredGames.map((game) => (
                        <TableRow key={game.gameAddress} className="border-gray-800 hover:bg-white/5">
                            <TableCell className="font-mono">{game.gameAddress.slice(0, 6)}...{game.gameAddress.slice(-4)}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-end gap-2 w-full">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm w-full">{game.totalPlayers} / {game.maxPlayers}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={getStatusStyles(game.status)}>
                                    {getStatusText(game.status)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex flex-row gap-2 items-end justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-max"
                                        onClick={() => handleJoinGame(game.gameAddress)}
                                    >
                                        Quick Join
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-fit"
                                        onClick={() => onSelectGame(game)}
                                    >
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )

    // Mobile Card View
    const MobileCardView = () => (
        <div className="space-y-4 mt-4">
            {filteredGames.map((game) => (
                <Card key={game.gameAddress} className="border-gray-800">
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="font-mono text-sm w-[70%] mr-2">
                                    {game.gameAddress.slice(0, 6)}...{game.gameAddress.slice(-4)}
                                </div>
                                <span className={cn(getStatusStyles(game.status), "w-fit")}>
                                    {getStatusText(game.status)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span className="text-sm">{game.totalPlayers} / {game.maxPlayers} players</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-fit"
                            onClick={() => onSelectGame(game)}
                        >
                            <Info className="h-4 w-4 mr-1" /> Details
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleJoinGame(game.gameAddress)}
                        >
                            Join <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )

    return (
        <>
            {/* Desktop view (hidden on mobile) */}
            <div className="hidden md:block">
                <DesktopTable />
            </div>

            {/* Mobile view (hidden on desktop) */}
            <div className="md:hidden">
                <MobileCardView />
            </div>
        </>
    )
} 