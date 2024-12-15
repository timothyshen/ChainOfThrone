'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useGameState } from '@/lib/hooks/useGameState'
import { Territory } from '@/types/Territory'
import { GameState } from '@/types/GameState'

interface GameContextType {
    territories: Territory[][]
    playerId: string | null
    isLoading: boolean
    gameState: GameState
    gameStatusLoading: boolean
    error: Error | null
    refreshGameData: () => Promise<void>
    updatePlayerId: (address: string) => Promise<void>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({
    children,
    gameAddressParam
}: {
    children: ReactNode
    gameAddressParam: `0x${string}`
}) {
    const gameState = useGameState(gameAddressParam)

    return (
        <GameContext.Provider value={gameState}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const context = useContext(GameContext)
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider')
    }
    return context
}