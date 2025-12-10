'use client'

import { useWatchContractEvent } from "wagmi"
import { useRouter } from "next/navigation"
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi"
import { GAME_FACTORY_ADDRESS, MONAD_GAME_FACTORY_ADDRESS } from "@/lib/constants/contracts"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import GameTable, { StatusFilter } from "./GameTable"
import GameFilters from "./GameFilters"

// Icons
import { Sword, Loader2, Copy, ExternalLink, Users, Clock, ArrowRight } from 'lucide-react'

// Hooks and Utils
import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/lib/hooks/use-toast"
import { getGamesInfo } from "@/lib/hooks/ReadGameFactoryContract"
import { debounce } from "@/lib/utils/debounce"
import { logger } from "@/lib/utils/logger"
import { getStatusDisplayText, getStatusBadgeStyles } from "@/lib/utils/gameStatus"

// Types
import { Game } from "@/lib/types/setup"

// Components
import { NoGamesEmptyState } from "@/components/common/EmptyState"
  
  
export default function GameExplorer() {
    const router = useRouter()
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [games, setGames] = useState<Game[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { toast } = useToast()

    const handleJoinGame = (gameAddress: string) => {
        localStorage.setItem("gameAddress", gameAddress)
        router.push(`/game/${gameAddress}`)
        toast({
            title: "Joining game",
            description: "Redirecting to game room...",
        })
    }

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address)
        toast({
            title: "Copied",
            description: "Game address copied to clipboard",
        })
    }

    useWatchContractEvent({
        address: MONAD_GAME_FACTORY_ADDRESS as `0x${string}`,
        abi: gameFactoryAbi,
        eventName: "GameCreated",
        onLogs: () => {
            debouncedFetchGames()
        }
    })

    const fetchGames = useCallback(async () => {
        try {
            const gamesInfo = await getGamesInfo()
            setGames(gamesInfo as Game[])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch games",
                variant: "destructive",
            })
            logger.error("Failed to fetch games:", error)
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    // Debounced fetch for event-triggered updates
    const debouncedFetchGames = useCallback(
        debounce(() => fetchGames(), 500),
        [fetchGames]
    )

    useEffect(() => {
        fetchGames()
    }, [fetchGames])

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex-1 mx-auto w-full max-w-[95vw] md:max-w-none">
            <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <Sword className="h-4 w-4 md:h-5 md:w-5" />
                    Available Battlegrounds
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search and Filter Controls */}
                <GameFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Games Table or Empty State */}
                {games.length === 0 ? (
                    <NoGamesEmptyState />
                ) : (
                    <GameTable
                        games={games}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        onSelectGame={setSelectedGame}
                    />
                )}
            </CardContent>

            {/* Game Details Dialog */}
            <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
                <DialogContent className="w-[calc(100vw-32px)] max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sword className="h-5 w-5" />
                            Game Details
                        </DialogTitle>
                        <DialogDescription>
                            View game information and join the battle
                        </DialogDescription>
                    </DialogHeader>

                    {selectedGame && (
                        <div className="space-y-4 py-2">
                            {/* Contract Address */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Contract Address</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-muted px-2 py-1.5 rounded text-xs font-mono truncate min-w-0">
                                        {selectedGame.gameAddress}
                                    </code>
                                </div>
                            </div>

                            {/* Game Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <div>
                                        <span className={getStatusBadgeStyles(selectedGame.status)}>
                                            {getStatusDisplayText(selectedGame.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Players</label>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        <span className="text-sm font-medium">{selectedGame.totalPlayers}/{selectedGame.maxPlayers}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Round</label>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span className="text-sm font-medium">{selectedGame.roundNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
        </Card>
    )
}

