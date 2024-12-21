'use client'

import { useWatchContractEvent } from "wagmi"
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi"
import { GAME_FACTORY_ADDRESS } from "@/lib/constants/contracts";


// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Icons
import { Search, Sword, Users, Info, Loader2 } from 'lucide-react'

// Hooks and Utils
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/lib/hooks/use-toast"
import { useAddPlayer } from '@/lib/hooks/useAddPlayer'
import { getGamesInfo } from "@/lib/hooks/ReadGameFactoryContract"

// Types
import { Game } from "@/lib/types/setup"

type GameStatus = 0 | 1 | 2
type StatusFilter = 'all' | 'open' | 'in progress' | 'full'

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
        0: 'bg-black text-green-400',
        1: 'bg-black text-yellow-400',
        2: 'bg-black text-red-400'
    }
    return `${baseStyles} ${statusStyles[status as GameStatus] ?? ''}`
}

export default function GameExplorer() {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [games, setGames] = useState<Game[]>([])
    const [isLoading, setIsLoading] = useState(true);


    const { toast } = useToast()
    const router = useRouter()
    const { addPlayer } = useAddPlayer()


    useWatchContractEvent({
        address: GAME_FACTORY_ADDRESS,
        abi: gameFactoryAbi,
        eventName: "GameCreated",
        onLogs: () => {
            fetchGames()
        }
    })

    const fetchGames = useCallback(async () => {
        try {
            const gamesInfo = await getGamesInfo(0, 10)
            setGames(gamesInfo as Game[])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch games",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchGames()
    }, [fetchGames])

    const handleJoinGame = async (gameAddress: string) => {
        try {
            localStorage.setItem("gameAddress", gameAddress)
            // await addPlayer(gameAddress as `0x${string}`);
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

    const filteredGames = games?.filter(game =>
        game.gameAddress.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || getStatusText(game.status).toLowerCase() === statusFilter)
    )

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Sword className="h-5 w-5" />
                    Available Battlegrounds
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3 h-4 w-4" />
                        <Input
                            placeholder="Search available games..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select onValueChange={(value) => setStatusFilter(value as StatusFilter)} defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Games Table */}
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
                            {filteredGames?.map((game) => (
                                <TableRow key={game.gameAddress} className="border-gray-800 hover:bg-white/5">
                                    <TableCell className="font-mono">{game.gameAddress.slice(0, 6)}...{game.gameAddress.slice(-4)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-end gap-1 w-full">
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
                                                onClick={() => setSelectedGame(game)}
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
            </CardContent>
        </Card>
    )
}

