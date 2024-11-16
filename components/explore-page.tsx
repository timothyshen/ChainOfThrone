'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus } from 'lucide-react'
import { useToast } from "@/lib/hooks/useToast"
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { GameSetupComponent } from '@/components/game-setup'
import { useRouter } from 'next/navigation'

type Game = {
  id: string
  name: string
  players: string[]
  maxPlayers: number
  status: 'Open' | 'In Progress' | 'Completed'
}

type Player = {
  id: string
  walletAddress: string
  wins: number
}

const mockGames: Game[] = [
  { id: '1', name: 'European Domination', players: ['0x1234...5678'], maxPlayers: 7, status: 'Open' },
  { id: '2', name: 'World War Diplomacy', players: ['0xabcd...ef01', '0x2345...6789', '0x3456...7890'], maxPlayers: 7, status: 'In Progress' },
  { id: '3', name: 'Allies vs Axis', players: ['0x4567...8901', '0x5678...9012', '0x6789...0123', '0x7890...1234', '0x8901...2345', '0x9012...3456'], maxPlayers: 6, status: 'Completed' },
  { id: '4', name: 'Cold War Negotiations', players: ['0xa123...b456', '0xc789...d012'], maxPlayers: 5, status: 'Open' },
  { id: '5', name: 'Mediterranean Conflict', players: ['0xe345...f678', '0xf901...2345', '0x0123...4567', '0x5678...9abc', '0xdef0...1234'], maxPlayers: 7, status: 'In Progress' },
]

const mockPlayers: Player[] = [
  { id: '1', walletAddress: '0x1234567890123456789012345678901234567890', wins: 15 },
  { id: '2', walletAddress: '0xabcdef0123456789abcdef0123456789abcdef01', wins: 12 },
  { id: '3', walletAddress: '0x2345678901234567890123456789012345678901', wins: 10 },
  { id: '4', walletAddress: '0x3456789012345678901234567890123456789012', wins: 9 },
  { id: '5', walletAddress: '0x4567890123456789012345678901234567890123', wins: 8 },
  { id: '6', walletAddress: '0x5678901234567890123456789012345678901234', wins: 7 },
  { id: '7', walletAddress: '0x6789012345678901234567890123456789012345', wins: 6 },
  { id: '8', walletAddress: '0x7890123456789012345678901234567890123456', wins: 5 },
  { id: '9', walletAddress: '0x8901234567890123456789012345678901234567', wins: 4 },
  { id: '10', walletAddress: '0x9012345678901234567890123456789012345678', wins: 3 },
  { id: '11', walletAddress: '0xa123456789012345678901234567890123456789', wins: 2 },
  { id: '12', walletAddress: '0xb234567890123456789012345678901234567890', wins: 1 },
]

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ExplorePageComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [games, setGames] = useState<Game[]>(mockGames)
  const [players, setPlayers] = useState<Player[]>(mockPlayers)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore Diplomacy Games</h1>
      <div className="flex flex-col md:flex-row gap-6">
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
                    <TableHead>Players</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>{game.name}</TableCell>
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

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Game Actions & Rankings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
              <DialogTrigger asChild>
                <Button className="mb-6">
                  <Plus className="mr-2 h-4 w-4" /> Create New Game
                </Button>
              </DialogTrigger>
              <GameSetupComponent onGameStart={() => { }} />
            </Dialog>

            <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <h3 className="text-lg font-semibold mb-2">Top 10 Players</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Wins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players
                    .sort((a, b) => b.wins - a.wins)
                    .slice(0, 10)
                    .map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{truncateAddress(player.walletAddress)}</TableCell>
                        <TableCell>{player.wins}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}