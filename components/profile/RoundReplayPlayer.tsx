import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Users,
  MapPin,
  ArrowRight,
  Sword,
  Info,
} from 'lucide-react'
import { ReconstructedRound, MoveRecord } from '@/lib/systems/RoundHistoryReconstructor'
import { CARD_CONTENT_PADDING } from '@/lib/constants/theme'
import { cn } from '@/lib/utils'

interface RoundReplayPlayerProps {
  round: ReconstructedRound
  onClose?: () => void
}

export function RoundReplayPlayer({ round, onClose }: RoundReplayPlayerProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!round || round.moves.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className={cn(CARD_CONTENT_PADDING.lg, "text-center")}>
          <div className="max-w-md mx-auto">
            <Info className="w-16 h-16 mx-auto mb-4 text-text-muted" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Moves in This Round</h3>
            <p className="text-sm text-text-secondary mb-4">
              This round doesn&apos;t contain any recorded moves. Players may not have submitted actions during this round.
            </p>
            {onClose && (
              <Button variant="outline" onClick={onClose} className="mt-4">
                Back to Timeline
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentMove = round.moves[currentMoveIndex]
  const progress = ((currentMoveIndex + 1) / round.moves.length) * 100

  // Guard against undefined currentMove (should not happen due to earlier check)
  if (!currentMove) {
    return null
  }

  const handlePrevious = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentMoveIndex < round.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement auto-play logic
  }

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getPlayerColor = (playerAddress: string) => {
    // Simple hash to consistent color
    const hash = playerAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500']
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Play className="w-5 h-5" />
              Round {round.roundNumber} Replay
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-surface-3 text-foreground">
                Move {currentMoveIndex + 1} / {round.moves.length}
              </Badge>
              {onClose && (
                <Button size="sm" variant="ghost" onClick={onClose} className="text-text-secondary">
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Move Display */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {/* Player Info */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-12 h-12 rounded-full ${getPlayerColor(
                currentMove.player
              )} flex items-center justify-center`}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-text-secondary">Player</div>
              <div className="text-lg font-semibold text-foreground">
                {currentMove.player.slice(0, 6)}...{currentMove.player.slice(-4)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Timestamp</div>
              <div className="text-sm text-foreground">
                {formatTimestamp(currentMove.timestamp)}
              </div>
            </div>
          </div>

          {/* Move Visualization */}
          <div className="bg-surface-3/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              {/* From Position */}
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-surface-3 rounded-lg border-2 border-blue-500 mb-2">
                  <MapPin className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs text-text-secondary">From</div>
                <div className="text-lg font-bold text-foreground">
                  ({currentMove.fromX}, {currentMove.fromY})
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-2">
                <ArrowRight className="w-12 h-12 text-yellow-400" />
                <Badge className="bg-yellow-500 text-black">
                  {currentMove.units.toString()} units
                </Badge>
              </div>

              {/* To Position */}
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-surface-3 rounded-lg border-2 border-green-500 mb-2">
                  <MapPin className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-xs text-text-secondary">To</div>
                <div className="text-lg font-bold text-foreground">
                  ({currentMove.toX}, {currentMove.toY})
                </div>
              </div>
            </div>

            {/* Distance Info */}
            <div className="text-center mt-4 text-sm text-text-secondary">
              Distance:{' '}
              {Math.abs(currentMove.toX - currentMove.fromX) +
                Math.abs(currentMove.toY - currentMove.fromY)}{' '}
              cells
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Start of Round</span>
              <span>End of Round</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentMoveIndex === 0}
              className="text-white border-border hover:bg-surface-3"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              onClick={handlePlayPause}
              className={`${
                isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
              } text-white px-8`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={currentMoveIndex === round.moves.length - 1}
              className="text-white border-border hover:bg-surface-3"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Moves List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">All Moves in Round {round.roundNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {round.moves.map((move, index) => (
              <button
                key={index}
                onClick={() => setCurrentMoveIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === currentMoveIndex
                    ? 'bg-surface-3 border border-yellow-500'
                    : 'bg-surface-3/30 hover:bg-surface-3/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm text-foreground">
                      {move.player.slice(0, 6)}...{move.player.slice(-4)}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    ({move.fromX},{move.fromY}) → ({move.toX},{move.toY})
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
