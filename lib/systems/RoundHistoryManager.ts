/**
 * RoundHistoryManager
 *
 * Manages round history and detects missed rounds
 * Persists data to localStorage for recovery after page refresh
 */

export interface RoundRecord {
  roundNumber: number
  timestamp: number
  viewed: boolean
  gameAddress: string
}

export interface MissedRoundsInfo {
  hasMissedRounds: boolean
  lastViewedRound: number
  currentRound: number
  missedRounds: number[]
}

export class RoundHistoryManager {
  private storageKeyPrefix = 'game_round_'

  /**
   * Get storage key for a game address
   */
  private getStorageKey(gameAddress: string): string {
    return `${this.storageKeyPrefix}${gameAddress.toLowerCase()}`
  }

  /**
   * Get last viewed round for a game
   */
  getLastViewedRound(gameAddress: string): number {
    if (typeof window === 'undefined') return 0

    try {
      const key = this.getStorageKey(gameAddress)
      const stored = localStorage.getItem(key)

      if (stored) {
        const data = JSON.parse(stored)
        return data.lastViewedRound || 0
      }
    } catch (error) {
      console.error('Error reading last viewed round:', error)
    }

    return 0
  }

  /**
   * Update last viewed round for a game
   */
  updateLastViewedRound(gameAddress: string, roundNumber: number): void {
    if (typeof window === 'undefined') return

    try {
      const key = this.getStorageKey(gameAddress)
      const data = {
        lastViewedRound: roundNumber,
        lastUpdated: Date.now(),
        gameAddress: gameAddress.toLowerCase(),
      }

      localStorage.setItem(key, JSON.stringify(data))
      console.log(`💾 Updated last viewed round to ${roundNumber} for game ${this.truncateAddress(gameAddress)}`)
    } catch (error) {
      console.error('Error updating last viewed round:', error)
    }
  }

  /**
   * Check for missed rounds
   */
  checkMissedRounds(gameAddress: string, currentRound: number): MissedRoundsInfo {
    const lastViewed = this.getLastViewedRound(gameAddress)

    // If this is first time or last viewed is current, no missed rounds
    if (lastViewed === 0 || lastViewed >= currentRound) {
      return {
        hasMissedRounds: false,
        lastViewedRound: lastViewed,
        currentRound,
        missedRounds: [],
      }
    }

    // Calculate missed rounds
    const missedRounds: number[] = []
    for (let round = lastViewed + 1; round < currentRound; round++) {
      missedRounds.push(round)
    }

    const hasMissedRounds = missedRounds.length > 0

    if (hasMissedRounds) {
      console.log(
        `⚠️ Detected ${missedRounds.length} missed rounds: ${missedRounds.join(', ')}`
      )
    }

    return {
      hasMissedRounds,
      lastViewedRound: lastViewed,
      currentRound,
      missedRounds,
    }
  }

  /**
   * Mark round as viewed
   */
  markRoundAsViewed(gameAddress: string, roundNumber: number): void {
    const lastViewed = this.getLastViewedRound(gameAddress)

    // Only update if this round is newer
    if (roundNumber > lastViewed) {
      this.updateLastViewedRound(gameAddress, roundNumber)
    }
  }

  /**
   * Clear history for a specific game
   */
  clearGameHistory(gameAddress: string): void {
    if (typeof window === 'undefined') return

    try {
      const key = this.getStorageKey(gameAddress)
      localStorage.removeItem(key)
      console.log(`🗑️ Cleared history for game ${this.truncateAddress(gameAddress)}`)
    } catch (error) {
      console.error('Error clearing game history:', error)
    }
  }

  /**
   * Get all tracked games
   */
  getAllTrackedGames(): string[] {
    if (typeof window === 'undefined') return []

    const games: string[] = []

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.storageKeyPrefix)) {
          const stored = localStorage.getItem(key)
          if (stored) {
            const data = JSON.parse(stored)
            games.push(data.gameAddress)
          }
        }
      }
    } catch (error) {
      console.error('Error getting tracked games:', error)
    }

    return games
  }

  /**
   * Clean up old game data (games finished > 7 days ago)
   */
  cleanupOldGames(finishedGames: string[], maxAgeDays: number = 7): void {
    if (typeof window === 'undefined') return

    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
    const now = Date.now()

    try {
      finishedGames.forEach((gameAddress) => {
        const key = this.getStorageKey(gameAddress)
        const stored = localStorage.getItem(key)

        if (stored) {
          const data = JSON.parse(stored)
          const age = now - (data.lastUpdated || 0)

          if (age > maxAgeMs) {
            localStorage.removeItem(key)
            console.log(
              `🗑️ Cleaned up old game: ${this.truncateAddress(gameAddress)}`
            )
          }
        }
      })
    } catch (error) {
      console.error('Error cleaning up old games:', error)
    }
  }

  /**
   * Export game history data (for debugging)
   */
  exportHistory(gameAddress: string): any {
    if (typeof window === 'undefined') return null

    try {
      const key = this.getStorageKey(gameAddress)
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error exporting history:', error)
      return null
    }
  }

  /**
   * Truncate address for logging
   */
  private truncateAddress(address: string): string {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}
