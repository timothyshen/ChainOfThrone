'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { Search, Shield, Sword, Trophy, Users, Moon, Sun, Info } from 'lucide-react'
import { GameDetailsModal } from './game-details-modal'
import { CreateGameModal } from './create-game-modal'
import { NotificationCenter } from './notification-center'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GameExplorer() {
    const { theme, setTheme } = useTheme()
    const [selectedGame, setSelectedGame] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)

    const games = [
        { id: 1, contract: '0xAd9570AA78E21a7C1bfe8167B78eD00c6Bdfb2e1', players: '0/2', status: 'Open' },
        { id: 2, contract: '0xe5975cE590E1BE41cE4727c6F54f0f0D9a19485d', players: '1/2', status: 'In Progress' },
        { id: 3, contract: '0xbDCf521cee7088d6f8495126194cFa7e8B59Bc7e8', players: '2/2', status: 'Full' },
        // Add more game data as needed
    ]

    const filteredGames = games.filter(game =>
        game.contract.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || game.status.toLowerCase() === statusFilter)
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black transition-colors duration-1000 ease-in-out">
            <div className="bg-black/60 min-h-screen backdrop-blur-sm">
                <header className="border-b border-gray-800 bg-black/80">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-8 w-8 text-white" />
                                <h1 className="text-2xl font-bold text-white font-medieval">Chain of Throne</h1>
                            </div>
                            <nav className="flex items-center gap-6">
                                <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-white/10">
                                    Explore
                                </Button>
                                <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-white/10">
                                    About
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                                <span className="sr-only">Toggle theme</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Toggle theme</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4 font-medieval">Explore Diplomacy Games</h2>
                        <p className="text-gray-400">Join a game room and prove your worth in the realm</p>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                        <Card className="border-gray-800 bg-black/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white flex items-center gap-2">
                                    <Sword className="h-5 w-5" />
                                    Available Battlegrounds
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 mb-6">
                                    <div className="relative flex-grow">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search available games..."
                                            className="pl-10 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select onValueChange={setStatusFilter} defaultValue="all">
                                        <SelectTrigger className="w-[180px] bg-black/30 border-gray-700 text-white">
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
                                                <TableHead className="text-gray-400">Smart Contract</TableHead>
                                                <TableHead className="text-gray-400 text-right">Players</TableHead>
                                                <TableHead className="text-gray-400 text-right">Status</TableHead>
                                                <TableHead className="text-gray-400 text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredGames.map((game) => (
                                                <TableRow key={game.id} className="border-gray-800 hover:bg-white/5">
                                                    <TableCell className="font-mono text-gray-300">{game.contract}</TableCell>
                                                    <TableCell className="text-right text-gray-300">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Users className="h-4 w-4" />
                                                            {game.players}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${game.status === 'Open' ? 'bg-green-900/30 text-green-400' :
                                                                game.status === 'In Progress' ? 'bg-yellow-900/30 text-yellow-400' :
                                                                    'bg-red-900/30 text-red-400'
                                                            }`}>
                                                            {game.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-white hover:bg-gray-200 text-black font-semibold mr-2"
                                                                        onClick={() => game.status === 'Open' && alert('Quick Join feature: Joining game ' + game.contract)}
                                                                        disabled={game.status !== 'Open'}
                                                                    >
                                                                        Quick Join
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{game.status === 'Open' ? 'Instantly join this game' : 'This game is not open for joining'}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedGame(game)}
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <div className="space-y-8">
                            <Button
                                className="w-full bg-white hover:bg-gray-200 text-black font-semibold h-12 text-lg"
                                onClick={() => setIsCreateGameOpen(true)}
                            >
                                Create New Battle
                            </Button>

                            <Card className="border-gray-800 bg-black/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white flex items-center gap-2">
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
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <TableRow key={i} className="border-gray-800">
                                                    <TableCell className="font-bold text-white">{i + 1}</TableCell>
                                                    <TableCell className="font-mono text-gray-300">0x{Math.random().toString(16).slice(2, 8)}</TableCell>
                                                    <TableCell className="text-right text-white">{20 - i * 2}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
            {selectedGame && (
                <GameDetailsModal game={selectedGame} onClose={() => setSelectedGame(null)} />
            )}
            <CreateGameModal isOpen={isCreateGameOpen} onClose={() => setIsCreateGameOpen(false)} />
            <NotificationCenter />
        </div>
    )
}

