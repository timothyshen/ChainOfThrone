'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/hooks/useToast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import ActionLog from './ActionLog'
import { Input } from "@/components/ui/input"
import { Star } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Territory, Unit, Player, Order, territories, initialUnits, initialPlayers } from '@/lib/types/game'
import GameStatus from './GameStatus'
import ExecutionLog from './ExecutionLog'

export default function DiplomacyGame() {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
    const [units, setUnits] = useState<Unit[]>(initialUnits)
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
    const [actionType, setActionType] = useState<'move' | 'split'>('move')
    const [splitStrength, setSplitStrength] = useState<number>(0)
    const [turnComplete, setTurnComplete] = useState<boolean>(false)
    const [actionLog, setActionLog] = useState<string[]>([])
    const [players, setPlayers] = useState<Player[]>(initialPlayers)
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(initialPlayers[0])
    const [countdown, setCountdown] = useState<number | null>(null)
    const [executionRecord, setExecutionRecord] = useState<string[]>([])
    const { toast } = useToast()


    const handleTerritoryClick = (territory: Territory) => {
        setSelectedTerritory(territory)
        setSelectedUnit(null)
        setActionType('move')
        setSplitStrength(0)
    }

    const handleUnitSelect = (unitId: string) => {
        const unit = units.find(u => u.id === unitId)
        setSelectedUnit(unit || null)
        setSplitStrength(0)
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

            let newOrder: Order = {
                type: actionType,
                unitId: selectedUnit.id,
                from: selectedUnit.position,
                to: targetTerritoryId,
            }

            if (actionType === 'split') {
                if (splitStrength <= 0 || splitStrength >= selectedUnit.strength) {
                    toast({
                        title: "Invalid Split",
                        description: "Split strength must be between 1 and the unit's current strength.",
                        variant: "destructive",
                    })
                    return
                }
                newOrder.splitStrength = splitStrength
            }


            if (actionType === 'move') {
                setUnits(prevUnits => prevUnits.map(u =>
                    u.id === selectedUnit.id ? { ...u, position: targetTerritoryId } : u
                ))
                setActionLog(prevLog => [...prevLog, `${selectedUnit.type} moved from ${currentTerritory.name} to ${targetTerritory.name}`])
            } else if (actionType === 'split') {
                const newUnitId = `unit${units.length + 1}`
                setUnits(prevUnits => [
                    ...prevUnits.map(u =>
                        u.id === selectedUnit.id ? { ...u, strength: u.strength - splitStrength } : u
                    ),
                    {
                        id: newUnitId,
                        type: selectedUnit.type,
                        countryId: selectedUnit.countryId,
                        position: targetTerritoryId,
                        strength: splitStrength
                    }
                ])
                setActionLog(prevLog => [...prevLog, `${selectedUnit.type} split from ${currentTerritory.name} to ${targetTerritory.name} with strength ${splitStrength}`])
            }

            toast({
                title: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Order Issued`,
                description: `${selectedUnit.type} ${actionType} from ${selectedUnit.position} to ${targetTerritoryId}`,
            })

            setSelectedUnit(null)
            setTurnComplete(true)

            // Update supply centers
            if (targetTerritory.type === 'supply') {
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
            setCountdown(30)
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
            setCountdown(null)
        }
    }

    const getWinningPlayer = () => {
        const [player1, player2] = players
        if (player1 == null || player2 == null) return
        if (player1.supplyCenters > player2.supplyCenters) {
            return player1
        } else if (player2.supplyCenters > player1.supplyCenters) {
            return player2
        }
        return null // It's a tie
    }

    const handleSendMessage = (recipientId: string, content: string) => {
        // In a real application, you would send this message to a server
        console.log(`Message sent to ${recipientId}: ${content}`)
        toast({
            title: "Message Sent",
            description: `Your message has been sent to ${players.find(p => p.id === recipientId)?.name}.`,
        })
    }


    const winningPlayer = getWinningPlayer()

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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Diplomacy Game Map</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <svg viewBox="0 0 300 300" className="w-full h-full">
                                        {territories.map((territory) => (
                                            <g key={territory.id}>
                                                <rect
                                                    x={territory.x * 100}
                                                    y={territory.y * 100}
                                                    width="100"
                                                    height="100"
                                                    fill={territory.type === 'supply' ? '#FFFACD' : 'white'}
                                                    stroke="black"
                                                    strokeWidth="2"
                                                    onClick={() => handleTerritoryClick(territory)}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                                <text
                                                    x={territory.x * 100 + 50}
                                                    y={territory.y * 100 + 40}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="black"
                                                    fontSize="12"
                                                >
                                                    {territory.name}
                                                </text>
                                                {territory.type === 'supply' && (
                                                    <Star
                                                        size={24}
                                                        fill="gold"
                                                        stroke="black"
                                                        strokeWidth={1}
                                                        x={territory.x * 100 + 38}
                                                        y={territory.y * 100 + 60}
                                                    />
                                                )}
                                                {units.filter(unit => unit.position === territory.id).map((unit, index) => (
                                                    <g key={unit.id}>
                                                        <circle
                                                            cx={territory.x * 100 + 50 + index * 20 - 10}
                                                            cy={territory.y * 100 + 80}
                                                            r="8"
                                                            fill={unit.type === 'army' ? 'black' : 'white'}
                                                            stroke="black"
                                                            strokeWidth="2"
                                                        />
                                                        <text
                                                            x={territory.x * 100 + 50 + index * 20 - 10}
                                                            y={territory.y * 100 + 95}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            fill="black"
                                                            fontSize="10"
                                                        >
                                                            {unit.strength}
                                                        </text>
                                                    </g>
                                                ))}
                                            </g>
                                        ))}
                                    </svg>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="chat">
                            <ChatSystem
                                players={players}
                                currentPlayerId={players[currentPlayerIndex].id}
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
                                    <p className="mb-2">Type: {selectedTerritory.type === 'supply' ? 'Supply Center' : 'Land Territory'}</p>
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
                                            <RadioGroup defaultValue="move" onValueChange={(value) => setActionType(value as 'move' | 'split')}>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="move" id="move" />
                                                    <Label htmlFor="move">Move</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="split" id="split" />
                                                    <Label htmlFor="split">Split</Label>
                                                </div>
                                            </RadioGroup>
                                            {actionType === 'split' && (
                                                <div className="mt-2">
                                                    <Label htmlFor="splitStrength">Split Strength:</Label>
                                                    <Input
                                                        id="splitStrength"
                                                        type="number"
                                                        min="1"
                                                        max={selectedUnit.strength - 1}
                                                        value={splitStrength}
                                                        onChange={(e) => setSplitStrength(parseInt(e.target.value))}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            )}
                                            <p className="mt-2 mb-2">{actionType.charAt(0).toUpperCase() + actionType.slice(1)} {selectedUnit.type} to:</p>
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