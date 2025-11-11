import { Territory, Army } from '@/lib/types/game'
import { getRoundNumber, get2DGrid } from '@/lib/hooks/ReadGameContract'
import { contractClient } from '@/lib/contract/client'
import { gameAbi } from '@/lib/contract/gameAbi'

/**
 * RoundHistoryReconstructor
 *
 * Reconstructs historical game states from on-chain move history
 * Enables full replay of past rounds
 */

export interface MoveRecord {
  player: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  units: bigint
  timestamp: bigint
  roundNumber: bigint
}

export interface ReconstructedRound {
  roundNumber: number
  moves: MoveRecord[]
  timestamp: number
  playerActions: Map<string, MoveRecord>
}

export interface GameHistory {
  totalRounds: number
  rounds: ReconstructedRound[]
  currentRound: number
  startTimestamp: number
  endTimestamp?: number
}

export class RoundHistoryReconstructor {
  /**
   * Get complete game history from contract
   */
  async getGameHistory(gameAddress: `0x${string}`): Promise<GameHistory> {
    try {
      console.log(`📚 Fetching game history for ${this.truncateAddress(gameAddress)}`)

      // Get current round number
      const currentRound = (await getRoundNumber(gameAddress)) as number

      if (!currentRound || currentRound === 0) {
        console.log('⚠️ No rounds completed yet')
        return {
          totalRounds: 0,
          rounds: [],
          currentRound: 0,
          startTimestamp: Date.now(),
        }
      }

      // Fetch all move history from contract
      const allMoves = await this.fetchAllMoves(gameAddress)

      // Group moves by round
      const rounds = this.groupMovesByRound(allMoves, currentRound)

      // Calculate timestamps
      const startTimestamp =
        rounds.length > 0 && rounds[0].moves.length > 0
          ? Number(rounds[0].moves[0].timestamp) * 1000
          : Date.now()

      const endTimestamp =
        rounds.length > 0 &&
        rounds[rounds.length - 1].moves.length > 0
          ? Number(
              rounds[rounds.length - 1].moves[
                rounds[rounds.length - 1].moves.length - 1
              ].timestamp
            ) * 1000
          : undefined

      const history: GameHistory = {
        totalRounds: currentRound,
        rounds,
        currentRound,
        startTimestamp,
        endTimestamp,
      }

      console.log(
        `✅ Retrieved history: ${history.totalRounds} rounds, ${allMoves.length} total moves`
      )

      return history
    } catch (error) {
      console.error('❌ Error fetching game history:', error)
      throw error
    }
  }

  /**
   * Get moves for a specific round
   */
  async getRoundMoves(
    gameAddress: `0x${string}`,
    roundNumber: number
  ): Promise<MoveRecord[]> {
    try {
      console.log(`📖 Fetching moves for round ${roundNumber}`)

      const moves = (await contractClient.readContract({
        address: gameAddress,
        abi: gameAbi,
        functionName: 'getRoundMoves',
        args: [BigInt(roundNumber)],
      })) as any[]

      const formattedMoves: MoveRecord[] = moves.map((move: any) => ({
        player: move.player,
        fromX: Number(move.fromX),
        fromY: Number(move.fromY),
        toX: Number(move.toX),
        toY: Number(move.toY),
        units: BigInt(move.units),
        timestamp: BigInt(move.timestamp),
        roundNumber: BigInt(move.roundNumber),
      }))

      console.log(`  Found ${formattedMoves.length} moves in round ${roundNumber}`)

      return formattedMoves
    } catch (error) {
      console.error(`❌ Error fetching round ${roundNumber} moves:`, error)
      return []
    }
  }

  /**
   * Fetch all moves from contract
   */
  private async fetchAllMoves(
    gameAddress: `0x${string}`
  ): Promise<MoveRecord[]> {
    try {
      const allMoves = (await contractClient.readContract({
        address: gameAddress,
        abi: gameAbi,
        functionName: 'getMoveHistory',
      })) as any[]

      const formattedMoves: MoveRecord[] = allMoves.map((move: any) => ({
        player: move.player,
        fromX: Number(move.fromX),
        fromY: Number(move.fromY),
        toX: Number(move.toX),
        toY: Number(move.toY),
        units: BigInt(move.units),
        timestamp: BigInt(move.timestamp),
        roundNumber: BigInt(move.roundNumber),
      }))

      return formattedMoves
    } catch (error) {
      console.error('Error fetching all moves:', error)
      return []
    }
  }

  /**
   * Group moves by round number
   */
  private groupMovesByRound(
    moves: MoveRecord[],
    totalRounds: number
  ): ReconstructedRound[] {
    const roundsMap = new Map<number, MoveRecord[]>()

    // Initialize all rounds
    for (let i = 0; i <= totalRounds; i++) {
      roundsMap.set(i, [])
    }

    // Group moves by round
    moves.forEach((move) => {
      const roundNum = Number(move.roundNumber)
      const existing = roundsMap.get(roundNum) || []
      roundsMap.set(roundNum, [...existing, move])
    })

    // Convert to array of ReconstructedRound
    const rounds: ReconstructedRound[] = []

    for (let i = 0; i <= totalRounds; i++) {
      const roundMoves = roundsMap.get(i) || []

      // Create player actions map
      const playerActions = new Map<string, MoveRecord>()
      roundMoves.forEach((move) => {
        playerActions.set(move.player.toLowerCase(), move)
      })

      rounds.push({
        roundNumber: i,
        moves: roundMoves,
        timestamp:
          roundMoves.length > 0
            ? Number(roundMoves[0].timestamp) * 1000
            : Date.now(),
        playerActions,
      })
    }

    return rounds
  }

  /**
   * Get statistics for a round
   */
  getRoundStatistics(round: ReconstructedRound): {
    totalMoves: number
    playersParticipated: number
    totalUnitsMoved: bigint
    averageUnitsPerMove: number
    longestMove: { distance: number; move: MoveRecord | null }
  } {
    const totalMoves = round.moves.length
    const playersParticipated = round.playerActions.size
    let totalUnitsMoved = BigInt(0)

    let longestMove = { distance: 0, move: null as MoveRecord | null }

    round.moves.forEach((move) => {
      totalUnitsMoved += move.units

      const distance =
        Math.abs(move.toX - move.fromX) + Math.abs(move.toY - move.fromY)
      if (distance > longestMove.distance) {
        longestMove = { distance, move }
      }
    })

    const averageUnitsPerMove =
      totalMoves > 0 ? Number(totalUnitsMoved) / totalMoves : 0

    return {
      totalMoves,
      playersParticipated,
      totalUnitsMoved,
      averageUnitsPerMove,
      longestMove,
    }
  }

  /**
   * Get player's moves in a specific round
   */
  getPlayerMovesInRound(
    round: ReconstructedRound,
    playerAddress: string
  ): MoveRecord | null {
    return round.playerActions.get(playerAddress.toLowerCase()) || null
  }

  /**
   * Get round summary
   */
  getRoundSummary(round: ReconstructedRound): string {
    const stats = this.getRoundStatistics(round)

    if (stats.totalMoves === 0) {
      return `Round ${round.roundNumber}: No moves recorded`
    }

    const players = Array.from(round.playerActions.keys())
      .map((addr) => this.truncateAddress(addr))
      .join(' vs ')

    return `Round ${round.roundNumber}: ${stats.totalMoves} moves, ${stats.playersParticipated} players (${players})`
  }

  /**
   * Truncate address for display
   */
  private truncateAddress(address: string): string {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}
