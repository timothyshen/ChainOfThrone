'use client'

import { useState, useEffect, useCallback } from 'react'
import { Territory, Army } from '@/lib/types/game'
import { GameStatusEnum, PlayerState } from '@/lib/types/gameStatus'
import { get2DGrid, addressToId, getMaxPlayer, totalPlayers, getGameStatus, getRoundSubmitted, idToAddress } from '@/lib/hooks/ReadGameContract'
import { useAccount } from 'wagmi'
import { useToast } from "@/lib/hooks/use-toast"

interface GameState {
  // Core game status
  gameStatus: GameStatusEnum
  totalPlayer: number
  maxPlayer: number
  playerAddresses: PlayerState[]
  playerId: string | null
  
  // Territory & Army data
  territories: Territory[][]
  armies: Army[]
  
  // Loading states
  isGridLoading: boolean
  isStatusLoading: boolean
}

interface GameStateActions {
  getGrids: () => Promise<void>
  getPlayerId: () => Promise<void>
  fetchGameData: () => Promise<void>
  refreshAllData: () => Promise<void>
}

export function useGameState(gameAddress: `0x${string}` | undefined): GameState & GameStateActions {
  const { address } = useAccount()
  const { toast } = useToast()

  // Core game status
  const [gameStatus, setGameStatus] = useState<GameStatusEnum>(GameStatusEnum.NOT_STARTED)
  const [totalPlayer, setTotalPlayer] = useState<number>(0)
  const [maxPlayer, setMaxPlayer] = useState<number>(0)
  const [playerAddresses, setPlayerAddresses] = useState<PlayerState[]>([])
  const [playerId, setPlayerId] = useState<string | null>(null)

  // Territory & Army data
  const [territories, setTerritories] = useState<Territory[][]>([])
  const [armies, setArmies] = useState<Army[]>([])

  // Loading states
  const [isGridLoading, setIsGridLoading] = useState(true)
  const [isStatusLoading, setIsStatusLoading] = useState(true)

  const getGameStatusText = (status: number): GameStatusEnum => {
    switch (status) {
      case 0: return GameStatusEnum.NOT_STARTED
      case 1: return GameStatusEnum.ONGOING
      case 2: return GameStatusEnum.COMPLETED
      default: return GameStatusEnum.NOT_STARTED
    }
  }

  const getGrids = useCallback(async () => {
    setIsGridLoading(true)
    try {
      if (!gameAddress) return

      const gridData = await get2DGrid(gameAddress)
      let armies: Army[] = []
      
      if (!gridData) return

      const newGridData = (gridData as any[][]).map((row: any[], rowIndex: number) =>
        row.map((territory: any, colIndex: number) => ({
          ...territory,
          x: colIndex,
          y: rowIndex,
        }))
      )

      // Mock data for development - replace with actual gridData when ready
      const data: Territory[][] = [
        [{
          id: "1", x: 0, y: 0, player: "0x123", units: [0n, 100n], isCastle: false, name: "Test",
        }, {
          id: "2", x: 1, y: 0, player: "0x133", units: [100n, 0n], isCastle: false, name: "Test",
        }, {
          id: "3", x: 2, y: 0, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }],
        [{
          id: "4", x: 0, y: 1, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }, {
          id: "5", x: 1, y: 1, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }, {
          id: "6", x: 2, y: 1, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }],
        [{
          id: "7", x: 0, y: 2, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }, {
          id: "8", x: 1, y: 2, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }, {
          id: "9", x: 2, y: 2, player: "0x123", units: [0n, 0n], isCastle: false, name: "Test",
        }]
      ]

      data.forEach((row: Territory[], rowIndex: number) => {
        row.forEach((territory: Territory, colIndex: number) => {
          territory.units.forEach((unit: bigint, index: number) => {
            if (unit > 0) {
              armies.push({
                id: `${rowIndex}-${colIndex}-${index}`,
                x: colIndex,
                y: rowIndex,
                size: unit,
                owner: territory.player,
                isMoving: false,
              })
            }
          })
        })
      })

      setTerritories(data)
      setArmies(armies)
    } catch (error) {
      console.error('Error fetching grid:', error)
      toast({
        title: "Error",
        description: "Failed to fetch game state",
        variant: "destructive",
      })
    } finally {
      setIsGridLoading(false)
    }
  }, [gameAddress, toast])

  const getPlayerId = useCallback(async () => {
    if (!gameAddress || !address) return
    try {
      const playerId = await addressToId(gameAddress, address)
      setPlayerId(playerId as string)
    } catch (error) {
      console.error('Error fetching player ID:', error)
    }
  }, [gameAddress, address])

  const fetchGameData = useCallback(async () => {
    setIsStatusLoading(true)
    try {
      if (!gameAddress) return

      const [status, total, max] = await Promise.all([
        getGameStatus(gameAddress),
        totalPlayers(gameAddress),
        getMaxPlayer(gameAddress)
      ])

      setGameStatus(getGameStatusText(status as number))
      setTotalPlayer(total as number)
      setMaxPlayer(max as number)

      if (total as number > 0) {
        const addresses = await Promise.all(
          Array.from({ length: 2 }, (_, i) =>
            Promise.all([
              idToAddress(gameAddress, i),
              getRoundSubmitted(gameAddress, i)
            ])
          )
        )

        setPlayerAddresses(addresses.map(([address, roundSubmitted]) => ({
          address: address as string,
          roundSubmitted: roundSubmitted as boolean
        })))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch game data",
        variant: "destructive",
      })
    } finally {
      setIsStatusLoading(false)
    }
  }, [gameAddress, toast])

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      getGrids(),
      getPlayerId(),
      fetchGameData()
    ])
  }, [getGrids, getPlayerId, fetchGameData])

  useEffect(() => {
    refreshAllData()
  }, [refreshAllData])

  return {
    // State
    gameStatus,
    totalPlayer,
    maxPlayer,
    playerAddresses,
    playerId,
    territories,
    armies,
    isGridLoading,
    isStatusLoading,
    
    // Actions
    getGrids,
    getPlayerId,
    fetchGameData,
    refreshAllData,
  }
}