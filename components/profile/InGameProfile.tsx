"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, History, BarChart3, Info } from "lucide-react"
import { GameHistoryView } from "./GameHistoryView"
import { CurrentGameStats } from "./CurrentGameStats"
import { useParams } from "next/navigation"
import { idToAddress } from "@/lib/hooks/ReadGameContract"

export default function GameProfile() {
    const params = useParams()
    const gameAddress = params?.address as `0x${string}` | undefined

    const [selectedView, setSelectedView] = useState<"overview" | "gameStats" | "history">("gameStats")
    const [player1Address, setPlayer1Address] = useState<`0x${string}` | null>(null)
    const [player2Address, setPlayer2Address] = useState<`0x${string}` | null>(null)

    // Fetch player addresses from contract
    useEffect(() => {
        async function fetchPlayerAddresses() {
            if (!gameAddress) return

            try {
                const p1Addr = await idToAddress(gameAddress, 0)
                const p2Addr = await idToAddress(gameAddress, 1)

                if (p1Addr) setPlayer1Address(p1Addr)
                if (p2Addr) setPlayer2Address(p2Addr)
            } catch (error) {
                console.error('Error fetching player addresses:', error)
            }
        }

        fetchPlayerAddresses()
    }, [gameAddress])

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">
                        {selectedView === "overview"
                            ? "Player Comparison"
                            : selectedView === "gameStats"
                            ? "Game Statistics"
                            : "Game History"}
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            variant={selectedView === "overview" ? "default" : "outline"}
                            className={selectedView === "overview" ? "text-white" : "text-slate-400"}
                            onClick={() => setSelectedView("overview")}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Overview
                        </Button>
                        {gameAddress && (
                            <Button
                                variant={selectedView === "gameStats" ? "default" : "outline"}
                                className={selectedView === "gameStats" ? "text-white" : "text-slate-400"}
                                onClick={() => setSelectedView("gameStats")}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Game Stats
                            </Button>
                        )}
                        {gameAddress && (
                            <Button
                                variant={selectedView === "history" ? "default" : "outline"}
                                className={selectedView === "history" ? "text-white" : "text-slate-400"}
                                onClick={() => setSelectedView("history")}
                            >
                                <History className="w-4 h-4 mr-2" />
                                Round History
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {selectedView === "history" && gameAddress ? (
                    <GameHistoryView gameAddress={gameAddress} />
                ) : selectedView === "gameStats" && gameAddress && player1Address && player2Address ? (
                    <CurrentGameStats
                        gameAddress={gameAddress}
                        player1Address={player1Address}
                        player2Address={player2Address}
                    />
                ) : (
                    <>
                        {/* Coming Soon Notice */}
                        <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 mb-6 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Info className="w-8 h-8 text-yellow-400" />
                                    <div>
                                        <h3 className="text-xl font-semibold">Cross-Game Statistics Coming Soon</h3>
                                        <p className="text-sm text-slate-300 mt-1">
                                            Player profiles with win rates, rankings, and cross-game statistics will be available
                                            when the game factory is deployed.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-yellow-400 border-yellow-400 whitespace-nowrap ml-auto">
                                        Coming Soon
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Players */}
                        <Card className="bg-slate-800 border-slate-700 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Players in this Game
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Player 1 */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback className="bg-blue-600 text-white">P1</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-400 mb-1">Player 1</div>
                                            <div className="font-mono text-sm text-white">
                                                {player1Address || "Loading..."}
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-500">ID: 0</Badge>
                                    </div>

                                    {/* Player 2 */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback className="bg-red-600 text-white">P2</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-400 mb-1">Player 2</div>
                                            <div className="font-mono text-sm text-white">
                                                {player2Address || "Loading..."}
                                            </div>
                                        </div>
                                        <Badge className="bg-red-500">ID: 1</Badge>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                                    <p className="text-sm text-slate-400 text-center">
                                        For detailed statistics about this game, check the{" "}
                                        <button
                                            onClick={() => setSelectedView("gameStats")}
                                            className="text-blue-400 hover:text-blue-300 underline"
                                        >
                                            Game Stats
                                        </button>{" "}
                                        tab
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
