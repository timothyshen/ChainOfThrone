import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Sword, Shield, Crown, Target, Calendar, MapPin, Star, TrendingUp, Award, Zap } from "lucide-react"
import GameFooter from "@/components/layout/GameFooter"

interface PlayerStats {
    id: string
    name: string
    avatar: string
    level: number
    experience: number
    maxExperience: number
    rank: string
    totalGames: number
    wins: number
    losses: number
    winRate: number
    favoriteStrategy: string
    achievements: Achievement[]
    recentMatches: Match[]
}

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
    rarity: "common" | "rare" | "epic" | "legendary"
}

interface Match {
    id: string
    opponent: string
    result: "win" | "loss" | "draw"
    duration: string
    date: string
    mapName: string
}

export default function ProfilePage() {

    const player1Stats: PlayerStats = {
        id: "p1",
        name: "Player 1",
        avatar: "/placeholder.svg?height=100&width=100&text=P1",
        level: 15,
        experience: 2350,
        maxExperience: 3000,
        rank: "Knight",
        totalGames: 47,
        wins: 32,
        losses: 15,
        winRate: 68,
        favoriteStrategy: "Aggressive Expansion",
        achievements: [
            {
                id: "1",
                name: "First Victory",
                description: "Win your first battle",
                icon: "trophy",
                unlockedAt: "2024-01-15",
                rarity: "common",
            },
            {
                id: "2",
                name: "Castle Conqueror",
                description: "Capture 10 castles",
                icon: "crown",
                unlockedAt: "2024-02-03",
                rarity: "rare",
            },
            {
                id: "3",
                name: "Master Strategist",
                description: "Win 5 games in a row",
                icon: "star",
                unlockedAt: "2024-02-20",
                rarity: "epic",
            },
        ],
        recentMatches: [
            {
                id: "1",
                opponent: "Player 2",
                result: "win",
                duration: "12:34",
                date: "2024-03-01",
                mapName: "Westeros",
            },
            {
                id: "2",
                opponent: "Player 2",
                result: "loss",
                duration: "08:45",
                date: "2024-02-28",
                mapName: "Westeros",
            },
            {
                id: "3",
                opponent: "Player 2",
                result: "win",
                duration: "15:22",
                date: "2024-02-25",
                mapName: "Westeros",
            },
        ],
    }

    const currentPlayer = player1Stats

    const getRarityColor = (rarity: Achievement["rarity"]) => {
        switch (rarity) {
            case "common":
                return "bg-gray-500"
            case "rare":
                return "bg-blue-500"
            case "epic":
                return "bg-purple-500"
            case "legendary":
                return "bg-yellow-500"
            default:
                return "bg-gray-500"
        }
    }

    const getAchievementIcon = (icon: string) => {
        switch (icon) {
            case "trophy":
                return <Trophy className="w-4 h-4" />
            case "crown":
                return <Crown className="w-4 h-4" />
            case "shield":
                return <Shield className="w-4 h-4" />
            case "star":
                return <Star className="w-4 h-4" />
            default:
                return <Award className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Player Profiles</h1>
                </div>

                {/* Player Overview */}
                <Card className="bg-slate-800 border-slate-700 mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={currentPlayer.avatar || "/placeholder.svg"} alt={currentPlayer.name} />
                                <AvatarFallback className="text-2xl bg-slate-700">
                                    {currentPlayer.name.charAt(0)}
                                    {currentPlayer.name.split(" ")[1]?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white">{currentPlayer.name}</h2>
                                    <Badge className="bg-yellow-600 text-yellow-100">
                                        <Crown className="w-3 h-3 mr-1" />
                                        {currentPlayer.rank}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-white">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{currentPlayer.level}</div>
                                        <div className="text-sm text-slate-400">Level</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{currentPlayer.wins}</div>
                                        <div className="text-sm text-slate-400">Wins</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{currentPlayer.losses}</div>
                                        <div className="text-sm text-slate-400">Losses</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{currentPlayer.winRate}%</div>
                                        <div className="text-sm text-slate-400">Win Rate</div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-white">
                                    <div className="flex justify-between text-sm">
                                        <span>Experience</span>
                                        <span>
                                            {currentPlayer.experience} / {currentPlayer.maxExperience}
                                        </span>
                                    </div>
                                    <Progress value={(currentPlayer.experience / currentPlayer.maxExperience) * 100} className="h-2" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Stats */}
                <Tabs defaultValue="stats" className="space-y-4 text-white">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                        <TabsTrigger value="stats" className="data-[state=active]:bg-slate-700">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Statistics
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="data-[state=active]:bg-slate-700">
                            <Trophy className="w-4 h-4 mr-2" />
                            Achievements
                        </TabsTrigger>
                        <TabsTrigger value="matches" className="data-[state=active]:bg-slate-700">
                            <Sword className="w-4 h-4 mr-2" />
                            Recent Matches
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats" className="space-y-4 ">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-slate-800 border-slate-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Combat Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Total Games</span>
                                        <span className="font-bold">{currentPlayer.totalGames}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Victories</span>
                                        <span className="font-bold text-green-400">{currentPlayer.wins}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Defeats</span>
                                        <span className="font-bold text-red-400">{currentPlayer.losses}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Win Rate</span>
                                        <span className="font-bold text-purple-400">{currentPlayer.winRate}%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Strategy Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Favorite Strategy</span>
                                        <span className="font-bold text-blue-400">{currentPlayer.favoriteStrategy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Current Rank</span>
                                        <Badge className="bg-yellow-600 text-yellow-100">{currentPlayer.rank}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Level</span>
                                        <span className="font-bold text-blue-400">{currentPlayer.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Achievements</span>
                                        <span className="font-bold text-purple-400">{currentPlayer.achievements.length}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                            {currentPlayer.achievements.map((achievement) => (
                                <Card key={achievement.id} className="bg-slate-800 border-slate-700 text-white">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                                                {getAchievementIcon(achievement.icon)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold mb-1">{achievement.name}</h3>
                                                <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {achievement.rarity}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3 inline mr-1" />
                                                        {achievement.unlockedAt}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="matches" className="space-y-4">
                        <Card className="bg-slate-800 border-slate-700 text-white">
                            <CardHeader>
                                <CardTitle>Recent Match History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {currentPlayer.recentMatches.map((match) => (
                                        <div key={match.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={match.result === "win" ? "default" : "destructive"}
                                                    className={
                                                        match.result === "win" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                                    }
                                                >
                                                    {match.result.toUpperCase()}
                                                </Badge>
                                                <div>
                                                    <div className="font-semibold">vs {match.opponent}</div>
                                                    <div className="text-sm text-slate-400 flex items-center gap-2">
                                                        <MapPin className="w-3 h-3" />
                                                        {match.mapName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-slate-400">
                                                <div>{match.duration}</div>
                                                <div>{match.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <GameFooter />
        </div>
    )
}
