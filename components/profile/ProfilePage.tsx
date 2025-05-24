'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useGameHistory } from '@/lib/hooks/useGameHistory'
import { cn } from '@/lib/utils'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import GameHistoryList from '@/components/profile/GameHistoryList'
import PlayerStats from '@/components/profile/PlayerStats'
import WalletInfo from '@/components/profile/WalletInfo'
import { PlayerRank, GameHistory } from '@/lib/types/setup'

export default function ProfilePage() {
    const { address, isConnected } = useAccount()
    const { gameHistory, playerRanks, isLoading } = useGameHistory()
    const [userGames, setUserGames] = useState<GameHistory[]>([])
    const [userStats, setUserStats] = useState<PlayerRank | null>(null)

    useEffect(() => {
        if (address && gameHistory.length > 0) {
            // Filter games this user participated in
            const filteredGames = gameHistory.filter(game =>
                game.players.includes(address as `0x${string}`)
            )
            setUserGames(filteredGames)

            // Find user stats in playerRanks
            const stats = playerRanks.find(player => player.address === address)
            if (stats) {
                setUserStats(stats)
            }
        }
    }, [address, gameHistory, playerRanks])

    if (!isConnected) {
        return (
            <div className={cn("container page-container")}>
                <div className={cn("flex flex-col items-center justify-center min-h-[60vh]")}>
                    <Card className={cn("w-full max-w-md")}>
                        <CardHeader>
                            <CardTitle>Connect Your Wallet</CardTitle>
                            <CardDescription>
                                Please connect your wallet to view your profile
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={cn("flex justify-center")}>
                                <Button>
                                    <Link href="/">
                                        Go to Home
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("container page-container")}>
            <h1 className={cn("text-3xl font-bold mb-6")}>My Profile</h1>

            <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6")}>
                {/* User Stats Card */}
                <div className={cn("md:col-span-1")}>
                    <WalletInfo address={address as `0x${string}`} />

                    <Card className={cn("mt-6")}>
                        <CardHeader>
                            <CardTitle>Game Statistics</CardTitle>
                            <CardDescription>Your performance stats</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PlayerStats
                                stats={userStats || {
                                    address: address as `0x${string}`,
                                    wins: 0,
                                    totalGames: 0,
                                    lastWinTimestamp: 0,
                                    winRate: 0
                                }}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>

                    <div className={cn("mt-6")}>
                        <Button variant="outline" className={cn("w-full")}>
                            <Link href="/explore" className={cn("flex items-center justify-center w-full")}>
                                <Gamepad2 className="mr-2 h-4 w-4" />
                                Find Games
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Game History */}
                <div className={cn("md:col-span-2")}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Game History</CardTitle>
                            <CardDescription>
                                Your recent games
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GameHistoryList
                                games={userGames}
                                isLoading={isLoading}
                                userAddress={address as `0x${string}`}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 