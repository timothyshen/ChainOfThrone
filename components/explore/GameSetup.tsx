'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/hooks/useToast"
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAccount } from 'wagmi'
import { Player, Unit } from '@/lib/types/game'

interface GameSetupProps {
  onGameStart: (players: Player[], units: Unit[]) => void
}

export function GameSetupComponent({ onGameStart }: GameSetupProps) {
  const { address } = useAccount()
  const [players, setPlayers] = useState<Player[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null)

  const handleAddPlayer = () => {
    if (!address || players.some(player => player.id === address)) return

    const newPlayer: Player = {
      id: address,
      name: address,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
      isReady: false,
      supplyCenters: 0
    }

    setPlayers([...players, newPlayer])
  }

  const handleUnitPlacement = (type: 'army' | 'fleet') => {
    if (!address || !selectedTerritory) return

    const playerUnitCount = units.filter(unit => unit.player === address).length
    if (playerUnitCount >= 3) {
      toast({
        title: "Unit Limit Reached",
        description: "You can only place 3 units per player.",
        variant: "destructive",
      })
      return
    }

    const newUnit: Unit = {
      id: `${address}-${Date.now()}`,
      type,
      position: selectedTerritory,
      strength: 10,
      player: address
    }

    setUnits([...units, newUnit])
    setSelectedTerritory(null)
  }

  const handleStartGame = () => {
    if (players.length >= 2 && units.length === players.length * 3) {
      onGameStart(players, units)
    } else {
      toast({
        title: "Invalid Setup",
        description: "Ensure all players have been added and each player has 3 units placed.",
        variant: "destructive",
      })
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Diplomacy Game Setup</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Player Address"
              value={address || ''}
              disabled
              className="mb-2"
            />
            <Button
              onClick={handleAddPlayer}
              disabled={!address || players.some(player => player.id === address)}
            >
              Join Game
            </Button>
          </div>

          {players.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Players ({players.length}/7):</h3>
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                    <span>{player.name}</span>
                    <span className="ml-auto">
                      {units.filter(unit => unit.player === player.id).length}/3 units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleStartGame}
          disabled={players.length < 2 || units.length !== players.length * 3}
        >
          Start Game
        </Button>
      </div>
    </DialogContent>
  )
}