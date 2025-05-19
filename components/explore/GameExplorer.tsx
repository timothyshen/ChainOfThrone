'use client'

import { useWatchContractEvent } from "wagmi"
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi"
import { GAME_FACTORY_ADDRESS, MONAD_GAME_FACTORY_ADDRESS } from "@/lib/constants/contracts"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GameTable, { StatusFilter } from "./GameTable"
import GameFilters from "./GameFilters"

// Icons
import { Sword, Loader2 } from 'lucide-react'

// Hooks and Utils
import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/lib/hooks/use-toast"
import { getGamesInfo } from "@/lib/hooks/ReadGameFactoryContract"

// Types
import { Game } from "@/lib/types/setup"
  
  
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
            fetchGames()
        }
    })

    const fetchGames = useCallback(async () => {
        try {
            const gamesInfo = await getGamesInfo()
            console.log("gamesInfo", gamesInfo)
            setGames(gamesInfo as Game[])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch games",
                variant: "destructive",
            })
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [toast])

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

                {/* Games Table */}

                <GameTable
                    games={games}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    onSelectGame={setSelectedGame}
                />
            </CardContent>
        </Card>
    )
}

