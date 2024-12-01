'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Sword, Trophy, Users, Info } from 'lucide-react'
import { CreateGameModal } from './GameSetup'
import { NotificationCenter } from './NotificationCenter'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGamesInfo } from "@/lib/hooks/ReadGameFactoryContract"
import { Game } from "@/lib/types/setup"
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { useAddPlayer } from '@/lib/hooks/useAddPlayer'
export default function GameExplorer() {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [games, setGames] = useState<Game[]>([])
    const { toast } = useToast()
    const router = useRouter()
    const { addPlayer } = useAddPlayer()
    // Replace mock games with real data fetching
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesInfo = await getGamesInfo(0, 10)
                setGames(gamesInfo as Game[])
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch games",
                    variant: "destructive",
                })
            }
        }
        fetchGames()
    }, [toast])

    const getStatusText = (status: number): string => ({
        0: "Open",
        1: "In Progress",
        2: "Completed"
    }[status] ?? "Unknown")

    const handleJoinGame = async (gameAddress: string) => {
        try {
            localStorage.setItem("gameAddress", gameAddress)
            // await addPlayer(gameAddress as `0x${string}`);
            router.push(`/play/${gameAddress}`)
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

    // Update filtering logic to work with real game data
    const filteredGames = games?.filter(game =>
        game.gameAddress.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || getStatusText(game.status).toLowerCase() === statusFilter)
    )

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="text-2xl  flex items-center gap-2">
                    <Sword className="h-5 w-5" />
                    Available Battlegrounds
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3 h-4 w-4 " />
                        <Input
                            placeholder="Search available games..."
                            className="pl-10 "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select onValueChange={setStatusFilter} defaultValue="all">
                        <SelectTrigger className="w-[180px] ">
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

                <ScrollArea className="h-[400px] pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead>Smart Contract</TableHead>
                                <TableHead className="text-right">Players</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGames?.map((game) => (
                                <TableRow key={game.gameAddress} className="border-gray-800 hover:bg-white/5">
                                    <TableCell className="font-mono">{game.gameAddress}</TableCell>
                                    <TableCell className="text-righta">
                                        <div className="flex items-center justify-end gap-1">
                                            <Users className="h-4 w-4" />
                                            {game.totalPlayers} / {game.maxPlayers}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${game.status === 0 ? 'bg-black text-green-400' :
                                            game.status === 1 ? 'bg-black/30 text-yellow-400' :
                                                'bg-black/30 text-red-400'
                                            }`}>
                                            {getStatusText(game.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-rol gap-2 items-end justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-max"
                                                onClick={() => handleJoinGame(game.gameAddress)}
                                                disabled={game.totalPlayers === game.maxPlayers}
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

