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

interface RoundReplayPlayerProps {
  round: ReconstructedRound
  onClose?: () => void
}

export function RoundReplayPlayer({ round, onClose }: RoundReplayPlayerProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!round || round.moves.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center text-slate-400">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No moves to replay in this round</p>
        </CardContent>
      </Card>
    )
  }

  const currentMove = round.moves[currentMoveIndex]
  const progress = ((currentMoveIndex + 1) / round.moves.length) * 100

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
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5" />
              Round {round.roundNumber} Replay
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-700 text-white">
                Move {currentMoveIndex + 1} / {round.moves.length}
              </Badge>
              {onClose && (
                <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400">
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Move Display */}
      <Card className="bg-slate-800 border-slate-700">
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
              <div className="text-sm text-slate-400">Player</div>
              <div className="text-lg font-semibold text-white">
                {currentMove.player.slice(0, 6)}...{currentMove.player.slice(-4)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Timestamp</div>
              <div className="text-sm text-slate-300">
                {formatTimestamp(currentMove.timestamp)}
              </div>
            </div>
          </div>

          {/* Move Visualization */}
          <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              {/* From Position */}
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-slate-700 rounded-lg border-2 border-blue-500 mb-2">
                  <MapPin className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs text-slate-400">From</div>
                <div className="text-lg font-bold text-white">
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
                <div className="flex items-center justify-center w-20 h-20 bg-slate-700 rounded-lg border-2 border-green-500 mb-2">
                  <MapPin className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-xs text-slate-400">To</div>
                <div className="text-lg font-bold text-white">
                  ({currentMove.toX}, {currentMove.toY})
                </div>
              </div>
            </div>

            {/* Distance Info */}
            <div className="text-center mt-4 text-sm text-slate-400">
              Distance:{' '}
              {Math.abs(currentMove.toX - currentMove.fromX) +
                Math.abs(currentMove.toY - currentMove.fromY)}{' '}
              cells
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Start of Round</span>
              <span>End of Round</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentMoveIndex === 0}
              className="text-white border-slate-600 hover:bg-slate-700"
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
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Moves List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">All Moves in Round {round.roundNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {round.moves.map((move, index) => (
              <button
                key={index}
                onClick={() => setCurrentMoveIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === currentMoveIndex
                    ? 'bg-slate-700 border border-yellow-500'
                    : 'bg-slate-900/30 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm text-slate-300">
                      {move.player.slice(0, 6)}...{move.player.slice(-4)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
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
