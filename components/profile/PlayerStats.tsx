'use client'

import { PlayerRank } from '@/lib/types/setup'
import { cn } from '@/lib/utils'
import { Trophy, X, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface PlayerStatsProps {
    stats: PlayerRank
    isLoading: boolean
}

export default function PlayerStats({ stats, isLoading }: PlayerStatsProps) {
    const lastWin = stats.lastWinTimestamp ? new Date(stats.lastWinTimestamp).toLocaleDateString() : 'Never'

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Never'
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className={cn("flex flex-col space-y-4 animate-pulse")}>
                <div className={cn("h-20 bg-muted rounded-lg")}></div>
                <div className={cn("h-6 w-2/3 bg-muted rounded-lg")}></div>
                <div className={cn("h-6 w-1/2 bg-muted rounded-lg")}></div>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col space-y-6")}>
            <div className={cn("grid grid-cols-3 gap-2")}>
                <div className={cn("flex flex-col items-center p-3 bg-muted/50 rounded-lg")}>
                    <Trophy className={cn("h-5 w-5 text-amber-500 mb-1")} />
                    <span className={cn("text-xl font-bold")}>{stats.wins}</span>
                    <span className={cn("text-xs text-muted-foreground")}>Wins</span>
                </div>

                <div className={cn("flex flex-col items-center p-3 bg-muted/50 rounded-lg")}>
                    <Zap className={cn("h-5 w-5 text-blue-500 mb-1")} />
                    <span className={cn("text-xl font-bold")}>{stats.totalGames}</span>
                    <span className={cn("text-xs text-muted-foreground")}>Games</span>
                </div>

                <div className={cn("flex flex-col items-center p-3 bg-muted/50 rounded-lg")}>
                    <X className={cn("h-5 w-5 text-red-500 mb-1")} />
                    <span className={cn("text-xl font-bold")}>{stats.totalGames - stats.wins}</span>
                    <span className={cn("text-xs text-muted-foreground")}>Losses</span>
                </div>
            </div>

            <div className={cn("space-y-2")}>
                <div className={cn("flex justify-between")}>
                    <span className={cn("text-sm text-muted-foreground")}>Win Rate</span>
                    <span className={cn("text-sm font-medium")}>{stats.winRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.winRate} className={cn("h-2")} />
            </div>

            <div className={cn("flex flex-col space-y-1")}>
                <div className={cn("flex justify-between")}>
                    <span className={cn("text-sm text-muted-foreground")}>Last Win</span>
                    <span className={cn("text-sm font-mono")}>{formatDate(stats.lastWinTimestamp)}</span>
                </div>
            </div>
        </div>
    )
} 