'use client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Game } from "@/lib/types/setup"
import { useToast } from "@/lib/hooks/useToast"
import { useRouter } from 'next/navigation'
import { getGamesInfo } from "@/lib/hooks/ReadGameFactoryContract"




function AvailableGameList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [games, setGames] = useState<Game[]>([])
    const router = useRouter()

    const { toast } = useToast()

    const getStatusText = (status: number): string => ({
        0: "Open",
        1: "In Progress",
        2: "Completed"
    }[status] ?? "Unknown")

    const filteredGames = games?.filter(game =>
        game.gameAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleJoinGame = async (gameAddress: string) => {
        try {


            localStorage.setItem("gameAddress", gameAddress)

            router.push(`/play/${gameAddress}`)
            toast({
                title: "Joining game...",
                description: `Attempting to join game at ${gameAddress}`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to join game",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesInfo = await getGamesInfo(0, 10)
                setGames(gamesInfo as Game[])
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch games",
                    variant: "destructive",
                })
            }
        }
        fetchGames()
    }, [toast])

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Available Games</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search games..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Smart Contract</TableHead>
                                <TableHead>Players</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGames?.map((game) => (
                                <TableRow key={game.gameAddress}>
                                    <TableCell>{game.gameAddress}</TableCell>
                                    <TableCell>{game.totalPlayers} / {game.maxPlayers}</TableCell>
                                    <TableCell>{getStatusText(game.status)}</TableCell>
                                    <TableCell>
                                        <Button
                                            disabled={game.totalPlayers === game.maxPlayers}
                                            onClick={() => handleJoinGame(game.gameAddress)}
                                        >
                                            Join
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

export default AvailableGameList