import { useState, useEffect } from 'react'
import { Territory } from '@/lib/types/game'
import { MoveRecord } from '@/lib/systems/RoundHistoryReconstructor'
import {
  get2DGrid,
  getRoundNumber,
  getGameStatus,
  totalPlayers,
  addressToId,
} from '@/lib/hooks/ReadGameContract'
import { contractClient } from '@/lib/contract/client'
import { gameAbi } from '@/lib/contract/gameAbi'
import { logger } from '@/lib/utils/logger'

/**
 * Player Game Statistics
 * Real-time stats calculated from blockchain data for a single game
 */

export interface TerritoryControl {
  territoriesControlled: number
  castlesControlled: number
  totalUnits: number
  controlPercentage: number
}

export interface MovementStats {
  totalMoves: number
  totalUnitsMoved: bigint
  averageUnitsPerMove: number
  longestMoveDistance: number
  roundsParticipated: number
}

export interface CombatStats {
  territoriesCaptured: number
  castlesCaptured: number
  // Estimated from grid changes - requires full history analysis
  estimatedUnitsLost: number
  estimatedUnitsDestroyed: number
}

export interface GameProgress {
  currentRound: number
  gameStatus: 'Not Started' | 'Ongoing' | 'Finished'
  playerId: number
  totalPlayers: number
  gameDuration?: number // milliseconds since first move
}

export interface PlayerGameStats {
  territoryControl: TerritoryControl
  movementStats: MovementStats
  combatStats: CombatStats
  gameProgress: GameProgress
  isLoading: boolean
  error: string | null
}

interface UsePlayerGameStatsOptions {
  gameAddress: `0x${string}`
  playerAddress: `0x${string}`
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

/**
 * Hook to fetch and calculate real-time game statistics for a player
 */
export function usePlayerGameStats({
  gameAddress,
  playerAddress,
  autoRefresh = false,
  refreshInterval = 5000,
}: UsePlayerGameStatsOptions): PlayerGameStats {
  const [stats, setStats] = useState<PlayerGameStats>({
    territoryControl: {
      territoriesControlled: 0,
      castlesControlled: 0,
      totalUnits: 0,
      controlPercentage: 0,
    },
    movementStats: {
      totalMoves: 0,
      totalUnitsMoved: BigInt(0),
      averageUnitsPerMove: 0,
      longestMoveDistance: 0,
      roundsParticipated: 0,
    },
    combatStats: {
      territoriesCaptured: 0,
      castlesCaptured: 0,
      estimatedUnitsLost: 0,
      estimatedUnitsDestroyed: 0,
    },
    gameProgress: {
      currentRound: 0,
      gameStatus: 'Not Started',
      playerId: 0,
      totalPlayers: 0,
    },
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | null = null

    const fetchStats = async () => {
      try {
        logger.debug(`Fetching stats for player ${playerAddress.slice(0, 6)}...`)

        // Fetch all required data in parallel
        const [grid, currentRound, gameStatus, playerId, totalPlayersCount, playerMoves] =
          await Promise.all([
            get2DGrid(gameAddress) as Promise<Territory[][]>,
            getRoundNumber(gameAddress) as Promise<number>,
            getGameStatus(gameAddress) as Promise<number>,
            addressToId(gameAddress, playerAddress) as Promise<number>,
            totalPlayers(gameAddress) as Promise<number>,
            fetchPlayerMoves(gameAddress, playerAddress),
          ])

        if (!isMounted) return

        // Calculate territory control from current grid
        const territoryControl = calculateTerritoryControl(grid, playerAddress, playerId)

        // Calculate movement stats from player moves
        const movementStats = calculateMovementStats(playerMoves, currentRound)

        // Calculate combat stats from move history
        const combatStats = calculateCombatStats(playerMoves)

        // Game progress
        const gameProgress: GameProgress = {
          currentRound: currentRound ?? 0,
          gameStatus: getGameStatusString(gameStatus ?? 0),
          playerId: playerId ?? 0,
          totalPlayers: totalPlayersCount ?? 0,
          gameDuration:
            playerMoves.length > 0 && playerMoves[0]
              ? Date.now() - Number(playerMoves[0].timestamp) * 1000
              : undefined,
        }

        setStats({
          territoryControl,
          movementStats,
          combatStats,
          gameProgress,
          isLoading: false,
          error: null,
        })

        logger.debug('Stats calculated successfully')
      } catch (error) {
        logger.error('Error fetching player stats:', error)
        if (isMounted) {
          setStats((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch stats',
          }))
        }
      }
    }

    // Initial fetch
    fetchStats()

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      intervalId = setInterval(fetchStats, refreshInterval)
    }

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [gameAddress, playerAddress, autoRefresh, refreshInterval])

  return stats
}

/**
 * Fetch player moves from contract
 */
async function fetchPlayerMoves(
  gameAddress: `0x${string}`,
  playerAddress: `0x${string}`
): Promise<MoveRecord[]> {
  try {
    const moves = (await contractClient.readContract({
      address: gameAddress,
      abi: gameAbi,
      functionName: 'getPlayerMoves',
      args: [playerAddress],
    })) as any[]

    return moves.map((move: any) => ({
      player: move.player,
      fromX: Number(move.fromX),
      fromY: Number(move.fromY),
      toX: Number(move.toX),
      toY: Number(move.toY),
      units: BigInt(move.units),
      timestamp: BigInt(move.timestamp),
      roundNumber: BigInt(move.roundNumber),
    }))
  } catch (error) {
    logger.error('Error fetching player moves:', error)
    return []
  }
}

/**
 * Calculate territory control from current grid state
 */
function calculateTerritoryControl(
  grid: Territory[][] | null,
  playerAddress: string,
  playerId: number
): TerritoryControl {
  if (!grid || grid.length === 0) {
    return {
      territoriesControlled: 0,
      castlesControlled: 0,
      totalUnits: 0,
      controlPercentage: 0,
    }
  }

  let territoriesControlled = 0
  let castlesControlled = 0
  let totalUnits = 0
  let totalTerritories = 0

  for (let x = 0; x < grid.length; x++) {
    const row = grid[x]
    if (!row) continue

    for (let y = 0; y < row.length; y++) {
      const territory = row[y]
      if (!territory) continue

      totalTerritories++

      if (territory.player.toLowerCase() === playerAddress.toLowerCase()) {
        territoriesControlled++
        if (territory.isCastle) {
          castlesControlled++
        }

        // Sum units for this player (units is array indexed by playerId)
        if (territory.units && territory.units[playerId]) {
          totalUnits += Number(territory.units[playerId])
        }
      }
    }
  }

  const controlPercentage =
    totalTerritories > 0 ? (territoriesControlled / totalTerritories) * 100 : 0

  return {
    territoriesControlled,
    castlesControlled,
    totalUnits,
    controlPercentage,
  }
}

/**
 * Calculate movement statistics from player moves
 */
function calculateMovementStats(
  moves: MoveRecord[],
  currentRound: number
): MovementStats {
  if (moves.length === 0) {
    return {
      totalMoves: 0,
      totalUnitsMoved: BigInt(0),
      averageUnitsPerMove: 0,
      longestMoveDistance: 0,
      roundsParticipated: 0,
    }
  }

  let totalUnitsMoved = BigInt(0)
  let longestMoveDistance = 0
  const roundsSet = new Set<number>()

  moves.forEach((move) => {
    totalUnitsMoved += move.units

    const distance = Math.abs(move.toX - move.fromX) + Math.abs(move.toY - move.fromY)
    if (distance > longestMoveDistance) {
      longestMoveDistance = distance
    }

    roundsSet.add(Number(move.roundNumber))
  })

  const averageUnitsPerMove = moves.length > 0 ? Number(totalUnitsMoved) / moves.length : 0

  return {
    totalMoves: moves.length,
    totalUnitsMoved,
    averageUnitsPerMove: Math.round(averageUnitsPerMove),
    longestMoveDistance,
    roundsParticipated: roundsSet.size,
  }
}

/**
 * Calculate combat statistics from move history
 * Note: This is a simplified version. Full combat stats would require
 * analyzing grid state changes between rounds.
 */
function calculateCombatStats(moves: MoveRecord[]): CombatStats {
  // For now, return basic stats
  // TODO: Implement full combat analysis by comparing grid states
  return {
    territoriesCaptured: 0, // Requires grid history
    castlesCaptured: 0, // Requires grid history
    estimatedUnitsLost: 0, // Requires grid history
    estimatedUnitsDestroyed: 0, // Requires grid history
  }
}

/**
 * Convert game status number to string
 */
function getGameStatusString(status: number): 'Not Started' | 'Ongoing' | 'Finished' {
  switch (status) {
    case 0:
      return 'Not Started'
    case 1:
      return 'Ongoing'
    case 2:
      return 'Finished'
    default:
      return 'Not Started'
  }
}
