"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Sword, Shield, Crown, Target, Zap, TrendingUp, Users, Clock, Star, Flame, Award } from "lucide-react"

interface PlayerProfile {
    id: string
    name: string
    avatar: string
    level: number
    experience: number
    maxExperience: number
    rank: string
    color: string
    stats: {
        totalGames: number
        wins: number
        losses: number
        winRate: number
        currentStreak: number
        bestStreak: number
        averageGameTime: string
        favoriteStrategy: string
        totalTroopsLost: number
        totalTroopsKilled: number
        castlesCaptured: number
        siegesWon: number
    }
}

export default function GameProfile() {
    const [selectedView, setSelectedView] = useState<"overview" | "detailed">("overview")

    const player1: PlayerProfile = {
        id: "p1",
        name: "P1",
        avatar: "/placeholder.svg?height=80&width=80&text=P1",
        level: 15,
        experience: 2350,
        maxExperience: 3000,
        rank: "Knight",
        color: "#4A90E2",
        stats: {
            totalGames: 47,
            wins: 32,
            losses: 15,
            winRate: 68,
            currentStreak: 3,
            bestStreak: 8,
            averageGameTime: "12:34",
            favoriteStrategy: "Aggressive Expansion",
            totalTroopsLost: 245,
            totalTroopsKilled: 387,
            castlesCaptured: 12,
            siegesWon: 8,
        },
    }

    const player2: PlayerProfile = {
        id: "p2",
        name: "P2",
        avatar: "/placeholder.svg?height=80&width=80&text=P2",
        level: 12,
        experience: 1850,
        maxExperience: 2500,
        rank: "Squire",
        color: "#D0021B",
        stats: {
            totalGames: 35,
            wins: 18,
            losses: 17,
            winRate: 51,
            currentStreak: 1,
            bestStreak: 5,
            averageGameTime: "15:22",
            favoriteStrategy: "Defensive Fortification",
            totalTroopsLost: 198,
            totalTroopsKilled: 234,
            castlesCaptured: 6,
            siegesWon: 4,
        },
    }

    const headToHeadStats = {
        totalMatches: 23,
        player1Wins: 14,
        player2Wins: 9,
        draws: 0,
        lastWinner: "Player 1",
        longestGame: "18:45",
        shortestGame: "6:23",
        averageGameLength: "12:34",
    }

    const StatCard = ({
        title,
        player1Value,
        player2Value,
        icon: Icon,
        format = "number",
        showComparison = true,
    }: {
        title: string
        player1Value: number | string
        player2Value: number | string
        icon: any
        format?: "number" | "percentage" | "time" | "string"
        showComparison?: boolean
    }) => {
        const formatValue = (value: number | string) => {
            if (format === "percentage") return `${value}%`
            if (format === "time") return value
            return value
        }

        const getWinner = () => {
            if (!showComparison || typeof player1Value !== "number" || typeof player2Value !== "number") return null
            if (player1Value > player2Value) return "p1"
            if (player2Value > player1Value) return "p2"
            return "tie"
        }

        const winner = getWinner()

        return (
            <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                        <div className={`text-center flex-1 ${winner === "p1" ? "text-blue-400 font-bold" : ""}`}>
                            <div className="text-lg font-semibold">{formatValue(player1Value)}</div>
                            {winner === "p1" && <Crown className="w-4 h-4 mx-auto text-yellow-400" />}
                        </div>
                        <div className="text-slate-500 text-xs">VS</div>
                        <div className={`text-center flex-1 ${winner === "p2" ? "text-red-400 font-bold" : ""}`}>
                            <div className="text-lg font-semibold">{formatValue(player2Value)}</div>
                            {winner === "p2" && <Crown className="w-4 h-4 mx-auto text-yellow-400" />}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Player Comparison</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            className="text-white"
                            disabled={true}
                        >
                            Overview
                        </Button>
                    </div>
                </div>

                {/* Player Headers */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Player 1 */}
                    <Card className="bg-slate-800 border-slate-700 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={player1.avatar || "/placeholder.svg"} alt={player1.name} />
                                    <AvatarFallback className="text-xl bg-blue-600">P1</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold">{player1.name}</h2>
                                        <Badge style={{ backgroundColor: player1.color }}>
                                            <Crown className="w-3 h-3 mr-1" />
                                            {player1.rank}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-slate-400 mb-2">Level {player1.level}</div>
                                    <Progress value={(player1.experience / player1.maxExperience) * 100} className="h-2" />
                                    <div className="text-xs text-slate-500 mt-1">
                                        {player1.experience} / {player1.maxExperience} XP
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Player 2 */}
                    <Card className="bg-slate-800 border-slate-700 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={player2.avatar || "/placeholder.svg"} alt={player2.name} />
                                    <AvatarFallback className="text-xl bg-red-600">P2</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold">{player2.name}</h2>
                                        <Badge style={{ backgroundColor: player2.color }}>
                                            <Crown className="w-3 h-3 mr-1" />
                                            {player2.rank}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-slate-400 mb-2">Level {player2.level}</div>
                                    <Progress value={(player2.experience / player2.maxExperience) * 100} className="h-2" />
                                    <div className="text-xs text-slate-500 mt-1">
                                        {player2.experience} / {player2.maxExperience} XP
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Head-to-Head Stats */}
                <Card className="bg-slate-800 border-slate-700 mb-6 text-white">
                    <CardHeader>
                        <CardTitle className="text-center flex items-center justify-center gap-2">
                            <Sword className="w-5 h-5" />
                            Head-to-Head Record
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-400">{headToHeadStats.player1Wins}</div>
                                <div className="text-sm text-slate-400">P1 Wins</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-400">{headToHeadStats.player2Wins}</div>
                                <div className="text-sm text-slate-400">P2 Wins</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-400">{headToHeadStats.totalMatches}</div>
                                <div className="text-sm text-slate-400">Total Games</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-400">{headToHeadStats.lastWinner}</div>
                                <div className="text-sm text-slate-400">Last Winner</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Win Rate"
                        player1Value={player1.stats.winRate}
                        player2Value={player2.stats.winRate}
                        icon={Trophy}
                        format="percentage"
                    />
                    <StatCard
                        title="Total Wins"
                        player1Value={player1.stats.wins}
                        player2Value={player2.stats.wins}
                        icon={Crown}
                    />
                    <StatCard
                        title="Current Streak"
                        player1Value={player1.stats.currentStreak}
                        player2Value={player2.stats.currentStreak}
                        icon={Flame}
                    />
                    <StatCard
                        title="Best Streak"
                        player1Value={player1.stats.bestStreak}
                        player2Value={player2.stats.bestStreak}
                        icon={Star}
                    />
                    <StatCard
                        title="Castles Captured"
                        player1Value={player1.stats.castlesCaptured}
                        player2Value={player2.stats.castlesCaptured}
                        icon={Shield}
                    />
                    <StatCard
                        title="Average Game Time"
                        player1Value={player1.stats.averageGameTime}
                        player2Value={player2.stats.averageGameTime}
                        icon={Clock}
                        format="time"
                        showComparison={false}
                    />
                </div>
            </div>
        </div>
    )
}
