'use client'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Game } from "@/lib/types/setup"
import { useToast } from "@/lib/hooks/useToast"
import { useRouter } from 'next/navigation'


const mockGames: Game[] = [
    { id: '1', smartContract: "0x223B80880C5E45dB7E369D877223F245Db23AadE", name: 'European Domination', players: ['0x1234...5678'], maxPlayers: 7, status: 'Open' },
    { id: '2', smartContract: "0x00E3239e071B3fB41F7d0B436860C8e74E2Cd408", name: 'World War Diplomacy', players: ['0xabcd...ef01', '0x2345...6789', '0x3456...7890'], maxPlayers: 7, status: 'In Progress' },
    { id: '3', smartContract: "0x5be6557d2198253686bAB06Bb044098039625243", name: 'Allies vs Axis', players: ['0x4567...8901', '0x5678...9012', '0x6789...0123', '0x7890...1234', '0x8901...2345', '0x9012...3456'], maxPlayers: 6, status: 'Completed' },
    { id: '4', smartContract: "0x8E9c33f55a8b3C80eeDef7461d28eC58C376edD0", name: 'Cold War Negotiations', players: ['0xa123...b456', '0xc789...d012'], maxPlayers: 5, status: 'Open' },
    { id: '5', smartContract: "0xaA65B6206F19601D990743E8aAcc1A234bDd0D3f", name: 'Mediterranean Conflict', players: ['0xe345...f678', '0xf901...2345', '0x0123...4567', '0x5678...9abc', '0xdef0...1234'], maxPlayers: 7, status: 'In Progress' },
]

function AvailableGameList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [games, setGames] = useState<Game[]>(mockGames)
    const router = useRouter()

    const { toast } = useToast()

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const handleJoinGame = (gameId: string) => {
        setGames(prevGames => prevGames.map(game => {
            if (game.id === gameId && game.players.length < game.maxPlayers) {
                // In a real app, you'd use the actual logged-in user's wallet address
                const newPlayerAddress = '0xnew...player'
                return {
                    ...game,
                    players: [...game.players, newPlayerAddress],
                    status: game.players.length + 1 === game.maxPlayers ? 'In Progress' : 'Open'
                }
            }
            return game
        }))

        toast({
            title: "Game Joined",
            description: "You have successfully joined the game.",
        })

        router.push(`/play/${gameId}`)
    }

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
                                <TableHead>Name</TableHead>
                                <TableHead>Smart Contract</TableHead>
                                <TableHead>Players</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGames.map((game) => (
                                <TableRow key={game.id}>
                                    <TableCell>{game.name}</TableCell>
                                    <TableCell>{game.smartContract}</TableCell>
                                    <TableCell>{game.players.length} / {game.maxPlayers}</TableCell>
                                    <TableCell>{game.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => handleJoinGame(game.id)}
                                            disabled={game.status !== 'Open' || game.players.length >= game.maxPlayers}
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