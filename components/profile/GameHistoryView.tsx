'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { RoundTimelineUI } from './RoundTimelineUI'
import { RoundReplayPlayer } from './RoundReplayPlayer'
import {
  RoundHistoryReconstructor,
  GameHistory,
  ReconstructedRound,
} from '@/lib/systems/RoundHistoryReconstructor'
import { getRoundNumber } from '@/lib/hooks/ReadGameContract'
import { AlertCircle } from 'lucide-react'

interface GameHistoryViewProps {
  gameAddress: `0x${string}`
}

export function GameHistoryView({ gameAddress }: GameHistoryViewProps) {
  const [history, setHistory] = useState<GameHistory | null>(null)
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load game history on mount
  useEffect(() => {
    async function loadHistory() {
      if (!gameAddress) return

      try {
        setIsLoading(true)
        setError(null)

        console.log(`🔍 Loading history for game: ${gameAddress}`)

        // Fetch current round
        const round = (await getRoundNumber(gameAddress)) as number
        setCurrentRound(round)

        // Fetch complete history using fresh reconstructor instance
        const reconstructor = new RoundHistoryReconstructor()
        const gameHistory = await reconstructor.getGameHistory(gameAddress)
        setHistory(gameHistory)

        console.log(`✅ Loaded ${gameHistory.rounds.length} rounds`)
      } catch (err) {
        console.error('❌ Error loading history:', err)
        setError('Failed to load game history. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [gameAddress])

  const handleSelectRound = (roundNumber: number) => {
    setSelectedRound(roundNumber)
  }

  const handleCloseReplay = () => {
    setSelectedRound(null)
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-text-secondary">Loading game history...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border border-red-500/50">
        <CardContent className="p-8 text-center text-red-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!history) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center text-text-secondary">
          <p>No history data available</p>
        </CardContent>
      </Card>
    )
  }

  const selectedRoundData = selectedRound !== null
    ? history.rounds.find((r) => r.roundNumber === selectedRound)
    : null

  return (
    <div className="space-y-6">
      {/* Timeline View */}
      {!selectedRoundData && (
        <RoundTimelineUI
          history={history}
          currentRound={currentRound}
          onSelectRound={handleSelectRound}
          selectedRound={selectedRound}
        />
      )}

      {/* Replay Player */}
      {selectedRoundData && (
        <RoundReplayPlayer
          round={selectedRoundData}
          onClose={handleCloseReplay}
        />
      )}
    </div>
  )
}
