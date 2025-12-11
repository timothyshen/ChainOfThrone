'use client'

import { useWatchContractEvent } from "wagmi"
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi"
import { MONAD_GAME_FACTORY_ADDRESS } from "@/lib/constants/contracts"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import GameTable, { StatusFilter } from "./GameTable"
import GameFilters from "./GameFilters"

// Icons
import { Sword, Loader2, Users, Clock } from 'lucide-react'

// Hooks and Utils
import { useState, useEffect, useCallback, useMemo } from 'react'
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
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [games, setGames] = useState<Game[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { toast } = useToast()

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
    const debouncedFetchGames = useMemo(
        () => debounce(() => fetchGames(), 500),
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
                        <div className="space-y-4 py-2 rounded-lg">
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

