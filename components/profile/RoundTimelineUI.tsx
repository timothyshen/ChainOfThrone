import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock,
  Play,
  Users,
  Sword,
  ChevronRight,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { GameHistory, ReconstructedRound } from '@/lib/systems/RoundHistoryReconstructor'
import { CARD_CONTENT_PADDING, BADGE_STYLES } from '@/lib/constants/theme'
import { cn } from '@/lib/utils'

interface RoundTimelineUIProps {
  history: GameHistory
  currentRound?: number
  onSelectRound: (roundNumber: number) => void
  selectedRound: number | null
}

export function RoundTimelineUI({
  history,
  currentRound,
  onSelectRound,
  selectedRound,
}: RoundTimelineUIProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')

  if (!history || history.rounds.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className={cn(CARD_CONTENT_PADDING.lg, "text-center")}>
          <div className="max-w-md mx-auto">
            <Activity className="w-16 h-16 mx-auto mb-4 text-text-muted" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Game History Yet</h3>
            <p className="text-sm text-text-secondary mb-4">
              Rounds will appear here as the game progresses. Make your first move to start creating history!
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-text-muted bg-surface-3/50 px-4 py-2 rounded-full">
              <Clock className="w-3 h-3" />
              Waiting for game activity...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoundStatus = (round: ReconstructedRound) => {
    if (round.roundNumber === currentRound) return 'current'
    if (round.roundNumber < (currentRound || 0)) return 'completed'
    return 'pending'
  }

  const getRoundColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      default:
        return 'bg-surface-3'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Round History Timeline
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-surface-3 text-foreground">
                {history.totalRounds} Rounds
              </Badge>
              {history.endTimestamp && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <ScrollArea className="h-[600px] rounded-md border border-border bg-card/50 p-6">
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-surface-3" />

            {/* Timeline Items */}
            <div className="space-y-6">
              {history.rounds.map((round, index) => {
                const status = getRoundStatus(round)
                const isSelected = selectedRound === round.roundNumber
                const isEmpty = round.moves.length === 0

                return (
                  <div
                    key={round.roundNumber}
                    className="relative pl-16 group"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-6 w-5 h-5 rounded-full border-4 border-card ${getRoundColor(
                        status
                      )} ${isSelected ? 'ring-4 ring-yellow-400/50' : ''} transition-all`}
                    />

                    {/* Round Card */}
                    <Card
                      className={`bg-card border-border hover:border-border transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' : ''
                      }`}
                      onClick={() => !isEmpty && onSelectRound(round.roundNumber)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-foreground">
                                Round {round.roundNumber}
                              </h3>
                              {status === 'current' && (
                                <Badge className="bg-yellow-500 text-black text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary">
                              {formatTimestamp(round.timestamp)}
                            </p>
                          </div>

                          {!isEmpty && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-surface-3"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Replay
                            </Button>
                          )}
                        </div>

                        {isEmpty ? (
                          <div className="text-sm text-text-muted italic">
                            No moves recorded
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-foreground">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span>{round.playerActions.size} Players</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                              <Sword className="w-4 h-4 text-red-400" />
                              <span>{round.moves.length} Moves</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span>
                                {round.moves.reduce((sum, m) => sum + Number(m.units), 0)}{' '}
                                Units
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Player Actions Preview */}
                        {!isEmpty && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="text-xs text-text-secondary space-y-1">
                              {Array.from(round.playerActions.entries()).map(
                                ([player, move]) => (
                                  <div
                                    key={player}
                                    className="flex items-center justify-between"
                                  >
                                    <span>
                                      {player.slice(0, 6)}...{player.slice(-4)}
                                    </span>
                                    <span className="text-text-muted">
                                      ({move.fromX},{move.fromY}) →
                                      ({move.toX},{move.toY})
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Summary Statistics */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {history.totalRounds}
              </div>
              <div className="text-sm text-text-secondary">Total Rounds</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {history.rounds.reduce((sum, r) => sum + r.moves.length, 0)}
              </div>
              <div className="text-sm text-text-secondary">Total Moves</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {formatTimestamp(history.startTimestamp)}
              </div>
              <div className="text-sm text-text-secondary">Game Started</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {currentRound || 0}
              </div>
              <div className="text-sm text-text-secondary">Current Round</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
