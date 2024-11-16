'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/hooks/useToast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import ActionLog from '@/components/gamePlay/ActionLog'
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Territory, Unit, Player, Order, territories, initialUnits, InitialPlayers } from '@/lib/types/game'
import GameStatus from '@/components/gamePlay/GameStatus'
import ExecutionLog from '@/components/gamePlay/ExecutionLog'
import ChatSystem from '@/components/gamePlay/ChatSystem'
import GameMap from '@/components/gamePlay/GameMap'

export default function DiplomacyGame() {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
    const [units, setUnits] = useState<Unit[]>(initialUnits)
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
    const [actionType, setActionType] = useState<string>('move')
    const [moveStrength, setMoveStrength] = useState<number>(0)
    const [turnComplete, setTurnComplete] = useState<boolean>(false)
    const [actionLog, setActionLog] = useState<string[]>([])
    const [players, setPlayers] = useState<Player[]>(InitialPlayers)
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(InitialPlayers[0] || null)
    const [executionRecord, setExecutionRecord] = useState<string[]>([])
    const { toast } = useToast()


    const handleTerritoryClick = (territory: Territory) => {
        setSelectedTerritory(territory)
        setSelectedUnit(null)
        setActionType('move')
        setMoveStrength(0)
    }

    const handleUnitSelect = (unitId: string) => {
        const unit = units.find(u => u.id === unitId)
        setSelectedUnit(unit || null)
        setMoveStrength(0)
    }

    const getAdjacentTerritories = (currentTerritory: Territory) => {
        return territories.filter(t =>
            (Math.abs(t.x - currentTerritory.x) === 1 && t.y === currentTerritory.y) ||
            (Math.abs(t.y - currentTerritory.y) === 1 && t.x === currentTerritory.x)
        )
    }

    const handleAction = (targetTerritoryId: string) => {
        if (selectedUnit && !turnComplete) {
            const currentTerritory = territories.find(t => t.id === selectedUnit.position)
            const targetTerritory = territories.find(t => t.id === targetTerritoryId)

            if (!currentTerritory || !targetTerritory) {
                toast({
                    title: "Invalid Move",
                    description: "Cannot determine the current or target territory.",
                    variant: "destructive",
                })
                return
            }

            const adjacentTerritories = getAdjacentTerritories(currentTerritory)

            if (!adjacentTerritories.some(t => t.id === targetTerritoryId)) {
                toast({
                    title: "Invalid Move",
                    description: "You can only move to adjacent territories (up, down, left, or right).",
                    variant: "destructive",
                })
                return
            }

            if (moveStrength <= 0 || moveStrength >= selectedUnit.strength) {
                setUnits(prevUnits => prevUnits.map(u =>
                    u.id === selectedUnit.id ? { ...u, position: targetTerritoryId } : u
                ))
                setActionLog(prevLog => [...prevLog,
                `${selectedUnit.type} moved all units from ${currentTerritory.name} to ${targetTerritory.name}`
                ])
            } else {
                const newUnitId = `unit${units.length + 1}`
                setUnits(prevUnits => [
                    ...prevUnits.map(u =>
                        u.id === selectedUnit.id ? { ...u, strength: u.strength - moveStrength } : u
                    ),
                    {
                        id: newUnitId,
                        type: selectedUnit.type,
                        countryId: selectedUnit.countryId,
                        position: targetTerritoryId,
                        strength: moveStrength
                    }
                ])
                setActionLog(prevLog => [...prevLog,
                `${selectedUnit.type} split ${moveStrength} units from ${currentTerritory.name} to ${targetTerritory.name}`
                ])
            }

            toast({
                title: "Move Order Issued",
                description: `${selectedUnit.type} moved from ${currentTerritory.name} to ${targetTerritory.name}${moveStrength > 0 ? ` with strength ${moveStrength}` : ''
                    }`,
            })

            setSelectedUnit(null)
            setTurnComplete(true)

            // Update supply centers
            if (targetTerritory.type === 'castle') {
                const otherPlayerId = currentPlayer?.id === 'player1' ? 'player2' : 'player1'
                setPlayers(prevPlayers => prevPlayers.map(p => {
                    if (p.id === currentPlayer?.id) {
                        return { ...p, supplyCenters: p.supplyCenters + 1 }
                    } else if (p.id === otherPlayerId) {
                        return { ...p, supplyCenters: Math.max(0, p.supplyCenters - 1) }
                    }
                    return p
                }))
            }
        }
    }

    const handleReady = () => {
        if (!turnComplete) {
            setPlayers(prevPlayers =>
                prevPlayers.map(p =>
                    p.id === currentPlayer?.id ? { ...p, isReady: true } : p
                )
            )
        } else {
            const allPlayersReady = players.every(p => p.isReady)
            if (allPlayersReady) {
                // Both players are ready, execute orders
                setExecutionRecord(prevRecord => [
                    ...prevRecord,
                    `${currentPlayer?.name}: ${actionLog.join(', ')}`
                ])
                setTurnComplete(false)
                setActionLog([])
                setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, isReady: false })))
                setCurrentPlayer(prevPlayer => {
                    const currentIndex = players.findIndex(p => p.id === prevPlayer?.id);
                    const nextIndex = (currentIndex + 1) % players.length;
                    return players[nextIndex] || null;
                })
            } else {
                // Current player is ready
                setPlayers(prevPlayers =>
                    prevPlayers.map(p =>
                        p.id === currentPlayer?.id ? { ...p, isReady: true } : p
                    )
                )
            }
        }
    }

    const handleSendMessage = (recipientId: string, content: string) => {
        // In a real application, you would send this message to a server
        console.log(`Message sent to ${recipientId}: ${content}`)
        toast({
            title: "Message Sent",
            description: `Your message has been sent to ${players.find(p => p.id === recipientId)?.name}.`,
        })
    }



    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1">
                <div className="flex-1 p-4">
                    <Tabs defaultValue="map" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="map">Game Map</TabsTrigger>
                            <TabsTrigger value="chat">Diplomacy Chat</TabsTrigger>
                        </TabsList>
                        <TabsContent value="map">
                            <GameMap
                                territories={territories}
                                units={units}
                                onTerritoryClick={handleTerritoryClick}
                            />
                        </TabsContent>
                        <TabsContent value="chat">
                            <ChatSystem
                                players={players}
                                currentPlayerId={currentPlayer?.id ?? ''}
                                onSendMessage={handleSendMessage}
                            />
                        </TabsContent>
                    </Tabs>

                </div>
                <div className="w-1/3 p-4 space-y-4">
                    <GameStatus currentPlayer={currentPlayer} players={players} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Territory Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedTerritory ? (
                                <div>
                                    <h3 className="text-lg font-bold mb-2">{selectedTerritory.name}</h3>
                                    <p className="mb-2">Type: {selectedTerritory.type === 'castle' ? 'castle' : 'land'}</p>
                                    <p className="mb-4">Units in this territory:</p>
                                    <Select onValueChange={handleUnitSelect} disabled={turnComplete}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.filter(unit => unit.position === selectedTerritory.id).map(unit => (
                                                <SelectItem key={unit.id} value={unit.id}>
                                                    {unit.type} (Strength: {unit.strength})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedUnit && !turnComplete && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Label htmlFor="moveStrength">Move Strength (optional):</Label>
                                                    <div className="flex gap-2 mt-1">
                                                        <Input
                                                            id="moveStrength"
                                                            type="number"
                                                            min="1"
                                                            max={selectedUnit.strength - 1}
                                                            value={moveStrength}
                                                            onChange={(e) => setMoveStrength(parseInt(e.target.value))}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setMoveStrength(selectedUnit.strength)}
                                                        >
                                                            Max ({selectedUnit.strength})
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-2 mb-2">Move {selectedUnit.type} to:</p>
                                            <div className="space-y-2">
                                                {getAdjacentTerritories(selectedTerritory).map(territory => (
                                                    <Button
                                                        key={territory.id}
                                                        className="w-full"
                                                        onClick={() => handleAction(territory.id)}
                                                    >
                                                        {territory.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>Select a territory to view information and actions.</p>
                            )}
                        </CardContent>
                    </Card>
                    <ActionLog actionLog={actionLog} />
                    <div className="flex space-x-2">
                        <Button className="flex-1" onClick={handleReady}>
                            {turnComplete ? 'End Turn' : 'Ready'}
                        </Button>
                    </div>
                </div>
            </div>

            <ExecutionLog executionRecord={executionRecord} />
        </div>
    )
}