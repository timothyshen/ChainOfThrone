'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/lib/hooks/useToast"
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAccount } from 'wagmi'

import { Player, Unit, InitialTerritories, AvailableCountries } from '@/lib/types/game'





export function GameSetupComponent({ onGameStart }: { onGameStart: (players: Player[], units: Unit[]) => void }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    id: '',
    name: '',
    color: '',
    country: '',
    isReady: false,
    supplyCenters: 0
  })
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null)

  const { address } = useAccount()

  const handleAddPlayer = () => {
    if (currentPlayer.name && currentPlayer.country) {
      const country = AvailableCountries.find(c => c.name === currentPlayer.country)
      if (country) {
        const newPlayer: Player = {
          ...currentPlayer,
          id: Date.now().toString(),
          color: country.color
        }
        setPlayers([...players, newPlayer])
        setCurrentPlayer({ id: '', name: '', color: '', country: '', isReady: false, supplyCenters: [] })
      }
    }
  }

  const handleUnitPlacement = (type: 'army') => {
    if (selectedTerritory && players.length > 0) {
      const newUnit: Unit = {
        id: Date.now().toString(),
        type: type,
        position: selectedTerritory,
        strength: 10,
        countryId: players.find(p => p.country === currentPlayer.country)?.id || ''
      }
      setUnits([...units, newUnit])
      setSelectedTerritory(null)
    }
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Diplomacy Game Setup</DialogTitle>
      </DialogHeader>
      <div>
        <div className="mb-4">
          <Input
            placeholder="Player Name"
            value={address}
            onChange={(e) => setCurrentPlayer({ ...currentPlayer, name: e.target.value })}
            className="mb-2"
          />
          <Select onValueChange={(value) => setCurrentPlayer({ ...currentPlayer, country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {AvailableCountries
                .filter(country => !players.some(player => player.country === country.name))
                .map(country => (
                  <SelectItem key={country.name} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <Button onClick={handleAddPlayer} className="mt-2">Add Player</Button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Players:</h3>
          {players.map(player => (
            <div key={player.id} className="mb-2">
              {player.name} - {player.country}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Unit Placement:</h3>
          <Select onValueChange={setSelectedTerritory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a territory" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(InitialTerritories).map(([id, territory]) => (
                <SelectItem key={id} value={id}>
                  {territory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2">
            <Button onClick={() => handleUnitPlacement('army')} className="mr-2">Place Army</Button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Placed Units:</h3>
          {units.map(unit => (
            <div key={unit.id} className="mb-2">
              {unit.type} in {InitialTerritories[unit.position]?.name}
            </div>
          ))}
        </div>
        <Button onClick={handleStartGame}>Start Game</Button>
      </div>
    </DialogContent>
  )
}