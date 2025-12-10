'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerGameStats } from '@/lib/hooks/usePlayerGameStats'
import { Trophy, MapPin, Sword, TrendingUp, Clock, Target, AlertCircle } from 'lucide-react'
import { CARD_CONTENT_PADDING, BADGE_STYLES, getGameStatusBadge, PLAYER_COLORS, TRANSITIONS } from '@/lib/constants/theme'
import { cn } from '@/lib/utils'

interface CurrentGameStatsProps {
  gameAddress: `0x${string}`
  player1Address: `0x${string}`
  player2Address: `0x${string}`
}

export function CurrentGameStats({
  gameAddress,
  player1Address,
  player2Address,
}: CurrentGameStatsProps) {
  const player1Stats = usePlayerGameStats({
    gameAddress,
    playerAddress: player1Address,
    autoRefresh: true,
    refreshInterval: 10000, // Refresh every 10 seconds
  })

  const player2Stats = usePlayerGameStats({
    gameAddress,
    playerAddress: player2Address,
    autoRefresh: true,
    refreshInterval: 10000,
  })

  // Loading state
  if (player1Stats.isLoading || player2Stats.isLoading) {
    return (
      <div className="space-y-6">
        {/* Game Status Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className={CARD_CONTENT_PADDING.md}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>

        {/* Territory Control Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className={CARD_CONTENT_PADDING.md}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </CardContent>
        </Card>

        {/* Movement Stats Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className={CARD_CONTENT_PADDING.md}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (player1Stats.error || player2Stats.error) {
    return (
      <Card className="bg-card border-border border-red-500/50">
        <CardContent className="p-8 text-center text-red-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{player1Stats.error || player2Stats.error}</p>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className={cn("space-y-6", TRANSITIONS.normal)}>
      {/* Game Status Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Current Game Statistics
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-surface-3">
                Round {player1Stats.gameProgress.currentRound}
              </Badge>
              <Badge className={getGameStatusBadge(player1Stats.gameProgress.gameStatus)}>
                {player1Stats.gameProgress.gameStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className={CARD_CONTENT_PADDING.md}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-text-secondary mb-1">Duration</div>
              <div className="text-foreground font-semibold">
                {formatDuration(player1Stats.gameProgress.gameDuration)}
              </div>
            </div>
            <div>
              <div className="text-text-secondary mb-1">Players</div>
              <div className="text-foreground font-semibold">
                {player1Stats.gameProgress.totalPlayers}
              </div>
            </div>
            <div>
              <div className="text-text-secondary mb-1">Current Round</div>
              <div className="text-foreground font-semibold">
                {player1Stats.gameProgress.currentRound}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Territory Control */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Territory Control
          </CardTitle>
        </CardHeader>
        <CardContent className={CARD_CONTENT_PADDING.md}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Player 1</div>
                <div className="text-xs text-text-muted">
                  {player1Address.slice(0, 6)}...{player1Address.slice(-4)}
                </div>
              </div>

              <div className="bg-surface-3/50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Territories</span>
                    <span className="text-blue-400 font-semibold">
                      {player1Stats.territoryControl.territoriesControlled}/9
                    </span>
                  </div>
                  <Progress
                    value={player1Stats.territoryControl.controlPercentage}
                    className="h-2 bg-surface-3"
                  />
                  <div className="text-xs text-blue-400 mt-1 text-right">
                    {player1Stats.territoryControl.controlPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {player1Stats.territoryControl.castlesControlled}
                    </div>
                    <div className="text-xs text-text-secondary">Castles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {player1Stats.territoryControl.totalUnits}
                    </div>
                    <div className="text-xs text-text-secondary">Total Units</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player 2 */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Player 2</div>
                <div className="text-xs text-text-muted">
                  {player2Address.slice(0, 6)}...{player2Address.slice(-4)}
                </div>
              </div>

              <div className="bg-surface-3/50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Territories</span>
                    <span className="text-red-400 font-semibold">
                      {player2Stats.territoryControl.territoriesControlled}/9
                    </span>
                  </div>
                  <Progress
                    value={player2Stats.territoryControl.controlPercentage}
                    className="h-2 bg-surface-3"
                  />
                  <div className="text-xs text-red-400 mt-1 text-right">
                    {player2Stats.territoryControl.controlPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {player2Stats.territoryControl.castlesControlled}
                    </div>
                    <div className="text-xs text-text-secondary">Castles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {player2Stats.territoryControl.totalUnits}
                    </div>
                    <div className="text-xs text-text-secondary">Total Units</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Movement Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className={CARD_CONTENT_PADDING.md}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Moves */}
            <div className="bg-surface-3/50 rounded-lg p-4 text-center">
              <div className="text-sm text-text-secondary mb-2">Total Moves</div>
              <div className="flex justify-around">
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {player1Stats.movementStats.totalMoves}
                  </div>
                  <div className="text-xs text-text-muted">P1</div>
                </div>
                <div className="border-l border-border mx-2" />
                <div>
                  <div className="text-xl font-bold text-red-400">
                    {player2Stats.movementStats.totalMoves}
                  </div>
                  <div className="text-xs text-text-muted">P2</div>
                </div>
              </div>
            </div>

            {/* Units Moved */}
            <div className="bg-surface-3/50 rounded-lg p-4 text-center">
              <div className="text-sm text-text-secondary mb-2">Units Moved</div>
              <div className="flex justify-around">
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {player1Stats.movementStats.totalUnitsMoved.toString()}
                  </div>
                  <div className="text-xs text-text-muted">P1</div>
                </div>
                <div className="border-l border-border mx-2" />
                <div>
                  <div className="text-xl font-bold text-red-400">
                    {player2Stats.movementStats.totalUnitsMoved.toString()}
                  </div>
                  <div className="text-xs text-text-muted">P2</div>
                </div>
              </div>
            </div>

            {/* Average per Move */}
            <div className="bg-surface-3/50 rounded-lg p-4 text-center">
              <div className="text-sm text-text-secondary mb-2">Avg per Move</div>
              <div className="flex justify-around">
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {player1Stats.movementStats.averageUnitsPerMove}
                  </div>
                  <div className="text-xs text-text-muted">P1</div>
                </div>
                <div className="border-l border-border mx-2" />
                <div>
                  <div className="text-xl font-bold text-red-400">
                    {player2Stats.movementStats.averageUnitsPerMove}
                  </div>
                  <div className="text-xs text-text-muted">P2</div>
                </div>
              </div>
            </div>

            {/* Participation */}
            <div className="bg-surface-3/50 rounded-lg p-4 text-center">
              <div className="text-sm text-text-secondary mb-2">Rounds Active</div>
              <div className="flex justify-around">
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {player1Stats.movementStats.roundsParticipated}
                  </div>
                  <div className="text-xs text-text-muted">P1</div>
                </div>
                <div className="border-l border-border mx-2" />
                <div>
                  <div className="text-xl font-bold text-red-400">
                    {player2Stats.movementStats.roundsParticipated}
                  </div>
                  <div className="text-xs text-text-muted">P2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Longest Move */}
          <div className="mt-4 bg-surface-3/50 rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-2 text-center">Longest Move Distance</div>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {player1Stats.movementStats.longestMoveDistance}
                </div>
                <div className="text-xs text-text-muted">Player 1 - cells</div>
              </div>
              <div className="border-l border-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {player2Stats.movementStats.longestMoveDistance}
                </div>
                <div className="text-xs text-text-muted">Player 2 - cells</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combat Stats - Coming Soon */}
      <Card className="bg-card border-border border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-text-muted" />
            <span className="text-text-secondary">Combat Statistics</span>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400 ml-auto">
              Coming Soon
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted text-center py-4">
            Combat statistics including territories captured, units destroyed, and K/D ratio
            will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
