'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/hooks/useToast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Territory, Unit, Player, initialUnits, InitialPlayers } from '@/lib/types/game'
import GameStatus from '@/components/gamePlay/GameStatus'
import ExecutionLog from '@/components/gamePlay/ExecutionLog'
import ChatSystem from '@/components/gamePlay/ChatSystem'
import GameMap from '@/components/gamePlay/GameMap'
import { get2DGrid } from '@/lib/hooks/ReadContract'
import { useAccount } from 'wagmi'
import { Move } from '@/lib/types/game'
import { useMakeMove } from '@/lib/hooks/useMakeMove'
import { useValidMove } from '@/lib/hooks/useValidMove'


export default function DiplomacyGame() {
    const [territories, setTerritories] = useState<any[]>([])
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
    const { address } = useAccount()
    const { makeMove } = useMakeMove()
    const { validMove } = useValidMove()

    useEffect(() => {
        const getGrids = async () => {
            try {
                const gridData = await get2DGrid();
                // Type assertion since we know the shape of the data
                setTerritories(gridData as Territory[]);
            } catch (error) {
                console.error('Error fetching grid:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch game state",
                    variant: "destructive",
                });
            }
        };

        getGrids();
    }, []);

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

    const handleAction = async (targetTerritoryId: string) => {
        if (selectedUnit && !turnComplete) {
            const currentTerritory = territories.find(t => t.id === selectedUnit.position)
            const targetTerritory = territories.find(t => t.id === targetTerritoryId)

            if (!currentTerritory || !targetTerritory || !address) {
                toast({
                    title: "Invalid Move",
                    description: "Cannot determine the territories or player address.",
                    variant: "destructive",
                })
                return
            }

            try {
                const move: Move = {
                    player: address,
                    fromX: currentTerritory.x,
                    fromY: currentTerritory.y,
                    toX: targetTerritory.x,
                    toY: targetTerritory.y,
                    units: moveStrength || selectedUnit.strength
                }

                // Check if move is valid
                const validMoveResult = await validMove(move)

                // If the move is not valid, show an error toast and return
                //@ts-ignore
                if (!validMoveResult) {
                    toast({
                        title: "Invalid Move",
                        description: "This move is not allowed by the game rules.",
                        variant: "destructive",
                    })
                    return
                }

                // Make the move on-chain
                await makeMove(move)

                toast({
                    title: "Move Submitted",
                    description: "Your move has been submitted to the blockchain",
                })

                setSelectedUnit(null)
                setTurnComplete(true)

            } catch (error) {
                console.error('Error making move:', error)
                toast({
                    title: "Error",
                    description: "Failed to submit move to the blockchain",
                    variant: "destructive",
                })
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
                </div>
            </div>

            <ExecutionLog executionRecord={executionRecord} />
        </div>
    )
}