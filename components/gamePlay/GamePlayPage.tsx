'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Territory = {
    id: string
    name: string
    type: 'land' | 'sea'
    path: string
    adjacentTo: string[]
    center?: string
    supplyCenter?: boolean
}

type Unit = {
    id: string
    type: 'army' | 'fleet'
    countryId: string
    position: string
    dislodged?: boolean
    mustRetreat?: boolean
}

type Order = {
    type: 'move' | 'support' | 'convoy' | 'retreat'
    unitId: string
    from: string
    to: string
    supportedUnitId?: string
    convoyChainsIds?: string[]
    strength?: number
}

type Player = {
    id: string
    name: string
    color: string
    supplyCenters: number
}

type GameState = {
    year: number
    season: 'Spring' | 'Fall'
    phase: 'order' | 'resolution' | 'retreat' | 'build'
    winner: Player | null
}

type ChatMessage = {
    senderId: string
    recipientId: string
    content: string
    timestamp: number
}

const territories: Territory[] = [
    { id: 'nwy', name: 'Norway', type: 'land', path: 'M100,60 L120,40 L140,60 L120,80 Z', adjacentTo: ['swe', 'fin', 'stp', 'bar', 'nth'], center: '120,60', supplyCenter: true },
    { id: 'swe', name: 'Sweden', type: 'land', path: 'M120,80 L140,60 L160,80 L140,100 Z', adjacentTo: ['nwy', 'fin', 'bot', 'bal', 'den'], center: '140,80', supplyCenter: true },
    { id: 'fin', name: 'Finland', type: 'land', path: 'M160,40 L180,20 L200,40 L180,60 Z', adjacentTo: ['nwy', 'swe', 'stp', 'bot'], center: '180,40', supplyCenter: true },
    { id: 'stp', name: 'St. Petersburg', type: 'land', path: 'M180,60 L200,40 L220,60 L200,80 Z', adjacentTo: ['nwy', 'fin', 'mos', 'lvn', 'bot', 'bar'], center: '200,60', supplyCenter: true },
    { id: 'mos', name: 'Moscow', type: 'land', path: 'M220,100 L240,80 L260,100 L240,120 Z', adjacentTo: ['stp', 'lvn', 'war', 'ukr', 'sev'], center: '240,100', supplyCenter: true },
    { id: 'lvn', name: 'Livonia', type: 'land', path: 'M180,100 L200,80 L220,100 L200,120 Z', adjacentTo: ['stp', 'mos', 'war', 'pru', 'bal'], center: '200,100', supplyCenter: false },
    { id: 'bar', name: 'Barents Sea', type: 'sea', path: 'M140,20 L160,0 L180,20 L160,40 Z', adjacentTo: ['nwy', 'stp'], center: '160,20', supplyCenter: false },
    { id: 'bot', name: 'Gulf of Bothnia', type: 'sea', path: 'M160,80 L180,60 L200,80 L180,100 Z', adjacentTo: ['swe', 'fin', 'stp', 'lvn', 'bal'], center: '180,80', supplyCenter: false },
    { id: 'bal', name: 'Baltic Sea', type: 'sea', path: 'M140,100 L160,80 L180,100 L160,120 Z', adjacentTo: ['swe', 'den', 'kie', 'ber', 'pru', 'lvn', 'bot'], center: '160,100', supplyCenter: false },
    { id: 'nth', name: 'North Sea', type: 'sea', path: 'M80,80 L100,60 L120,80 L100,100 Z', adjacentTo: ['nwy', 'ska', 'den', 'hel', 'hol', 'bel', 'eng', 'edi', 'nwg'], center: '100,80', supplyCenter: false },
]

const initialUnits: Unit[] = [
    { id: 'unit1', type: 'fleet', countryId: 'russia', position: 'stp' },
    { id: 'unit2', type: 'army', countryId: 'russia', position: 'mos' },
    { id: 'unit3', type: 'fleet', countryId: 'england', position: 'nth' },
    { id: 'unit4', type: 'army', countryId: 'germany', position: 'ber' },
    { id: 'unit5', type: 'fleet', countryId: 'germany', position: 'kie' },
]

const initialPlayers: Player[] = [
    { id: 'russia', name: 'Russia', color: '#008000', supplyCenters: 2 },
    { id: 'england', name: 'England', color: '#FF0000', supplyCenters: 1 },
    { id: 'germany', name: 'Germany', color: '#000000', supplyCenters: 2 },
]

const VICTORY_CONDITION = 5 // Number of supply centers needed to win

function ChatSystem({ players, currentPlayerId, onSendMessage }: { players: Player[], currentPlayerId: string, onSendMessage: (recipientId: string, content: string) => void }) {
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null)
    const [messageContent, setMessageContent] = useState('')
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const chatContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatMessages])

    const handleSendMessage = () => {
        if (selectedRecipient && messageContent.trim()) {
            onSendMessage(selectedRecipient, messageContent.trim())
            setChatMessages(prev => [...prev, {
                senderId: currentPlayerId,
                recipientId: selectedRecipient,
                content: messageContent.trim(),
                timestamp: Date.now()
            }])
            setMessageContent('')
        }
    }

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <CardTitle>Diplomacy Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <Select onValueChange={(value) => setSelectedRecipient(value)}>
                    <SelectTrigger className="w-full mb-4">
                        <SelectValue placeholder="Select a player to message" />
                    </SelectTrigger>
                    <SelectContent>
                        {players.filter(p => p.id !== currentPlayerId).map(player => (
                            <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <ScrollArea className="flex-grow mb-4 p-4 border rounded" ref={chatContainerRef}>
                    {chatMessages
                        .filter(msg => msg.senderId === currentPlayerId || msg.recipientId === currentPlayerId)
                        .map((msg, index) => (
                            <div key={index} className={`mb-2 ${msg.senderId === currentPlayerId ? 'text-right' : 'text-left'}`}>
                                <span className="inline-block bg-primary text-primary-foreground rounded px-2 py-1">
                                    {msg.content}
                                </span>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {msg.senderId === currentPlayerId ? 'You' : players.find(p => p.id === msg.senderId)?.name}
                                    {' - '}
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                </ScrollArea>
                <div className="flex">
                    <Input
                        type="text"
                        placeholder="Type your message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-grow mr-2"
                    />
                    <Button onClick={handleSendMessage} disabled={!selectedRecipient || !messageContent.trim()}>Send</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DiplomacyGame() {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
    const [units, setUnits] = useState<Unit[]>(initialUnits)
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [actionType, setActionType] = useState<'move' | 'support' | 'convoy' | 'retreat'>('move')
    const [players, setPlayers] = useState<Player[]>(initialPlayers)
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
    const [gameState, setGameState] = useState<GameState>({
        year: 1901,
        season: 'Spring',
        phase: 'order',
        winner: null,
    })
    const [showVictoryDialog, setShowVictoryDialog] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (gameState.phase === 'resolution') {
            resolveOrders()
        } else if (gameState.phase === 'retreat') {
            handleRetreatPhase()
        }
    }, [gameState.phase])

    useEffect(() => {
        checkVictoryCondition()
    }, [players])

    const handleTerritoryClick = (territory: Territory) => {
        setSelectedTerritory(territory)
        setSelectedUnit(null)
        setActionType('move')
    }

    const handleUnitSelect = (unitId: string) => {
        const unit = units.find(u => u.id === unitId)
        setSelectedUnit(unit || null)
    }

    const handleAction = (targetTerritoryId: string) => {
        if (selectedUnit && selectedTerritory) {
            let newOrder: Order = {
                type: actionType,
                unitId: selectedUnit.id,
                from: selectedUnit.position,
                to: targetTerritoryId,
                strength: 1, // Base strength for all orders
            }

            if (actionType === 'support') {
                if (!selectedTerritory.adjacentTo.includes(targetTerritoryId)) {
                    toast({
                        title: "Invalid Support",
                        description: "Support can only be given to adjacent territories.",
                        variant: "destructive",
                    })
                    return
                }
                const supportedUnit = units.find(u => u.position === targetTerritoryId)
                if (supportedUnit) {
                    newOrder.supportedUnitId = supportedUnit.id
                }
            }

            if (actionType === 'convoy') {
                const fleetChain = findConvoyChain(selectedUnit.position, targetTerritoryId)
                if (!fleetChain) {
                    toast({
                        title: "Invalid Convoy",
                        description: "No valid fleet chain found for convoy.",
                        variant: "destructive",
                    })
                    return
                }
                newOrder.convoyChainsIds = fleetChain.map(unit => unit.id)
            }

            setOrders(prevOrders => [...prevOrders, newOrder])

            toast({
                title: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Order Issued`,
                description: `${selectedUnit.type} ${actionType} from ${selectedUnit.position} to ${targetTerritoryId}`,
            })

            setSelectedUnit(null)
        }
    }

    const findConvoyChain = (start: string, end: string): Unit[] | null => {
        const fleets = units.filter(u => u.type === 'fleet')
        const visited = new Set<string>()

        const dfs = (current: string, path: Unit[]): Unit[] | null => {
            if (current === end) return path

            visited.add(current)

            for (const fleet of fleets) {
                if (!visited.has(fleet.position)) {
                    const result = dfs(fleet.position, [...path, fleet])
                    if (result) return result
                }
            }

            return null
        }

        return dfs(start, [])
    }

    const calculateOrderStrength = (order: Order, allOrders: Order[]): number => {
        let strength = 1 // Base strength

        // Add strength for supporting units
        const supportOrders = allOrders.filter(o =>
            o.type === 'support' &&
            o.supportedUnitId === order.unitId &&
            o.to === order.to
        )

        strength += supportOrders.length

        return strength
    }

    const resolveConflict = (conflictingOrders: Order[]): Order | null => {
        let maxStrength = 0
        let winningOrder: Order | null = null

        for (const order of conflictingOrders) {
            if (order.strength && order.strength > maxStrength) {
                maxStrength = order.strength
                winningOrder = order
            } else if (order.strength === maxStrength) {
                // If strengths are equal, the move fails and no one wins
                winningOrder = null
            }
        }

        return winningOrder
    }

    const resolveOrders = () => {
        const newUnits = [...units]
        const moveOrders = orders.filter(o => o.type === 'move')
        const supportOrders = orders.filter(o => o.type === 'support')
        const convoyOrders = orders.filter(o => o.type === 'convoy')

        // Calculate strengths for all orders
        const ordersWithStrength = orders.map(order => ({
            ...order,
            strength: calculateOrderStrength(order, orders)
        }))

        // Resolve moves
        moveOrders.forEach(order => {
            const unit = newUnits.find(u => u.id === order.unitId)
            if (unit) {
                // Find all orders trying to move to the same territory
                const conflictingMoves = ordersWithStrength.filter(o => o.to === order.to && o.unitId !== order.unitId)

                if (conflictingMoves.length === 0) {
                    // No conflict, move succeeds
                    unit.position = order.to
                } else {
                    // Resolve conflict
                    const winningOrder = resolveConflict([order, ...conflictingMoves])

                    if (winningOrder && winningOrder.unitId === order.unitId) {
                        // This order wins, move succeeds
                        unit.position = order.to

                        // Dislodge any unit in the destination
                        const unitInDestination = newUnits.find(u => u.position === order.to && u.id !== order.unitId)
                        if (unitInDestination) {
                            unitInDestination.dislodged = true
                            unitInDestination.mustRetreat = true
                        }
                    } else if (!winningOrder) {
                        // Standoff, all units stay in place
                    } else {
                        // This order loses, unit is dislodged if another unit moves to its position
                        const winningUnit = newUnits.find(u => u.id === winningOrder.unitId)
                        if (winningUnit && winningUnit.position === unit.position) {
                            unit.dislodged = true
                            unit.mustRetreat = true
                        }
                    }
                }
            }
        })

        // Resolve convoys
        convoyOrders.forEach(order => {
            const unit = newUnits.find(u => u.id === order.unitId)
            if (unit) {
                // Check if the convoy chain is still valid
                const isConvoyValid = order.convoyChainsIds?.every(fleetId =>
                    !newUnits.find(u => u.id === fleetId)?.dislodged
                )

                if (isConvoyValid) {
                    unit.position = order.to
                }
            }
        })

        setUnits(newUnits)
        updateSupplyCenters(newUnits)
        setOrders([])

        // Check if any units need to retreat
        const unitsNeedingRetreat = newUnits.filter(u => u.mustRetreat)
        if (unitsNeedingRetreat.length > 0) {
            setGameState(prevState => ({ ...prevState, phase: 'retreat' }))
        } else {
            advanceGameState()
        }

        toast({
            title: "Orders Resolved",
            description: "All orders have been processed and the map updated.",
        })
    }

    const handleRetreatPhase = () => {
        const unitsNeedingRetreat = units.filter(u => u.mustRetreat)
        if (unitsNeedingRetreat.length > 0) {
            toast({
                title: "Retreat Phase",
                description: `${unitsNeedingRetreat.length} unit(s) must retreat. Select a unit and choose a valid retreat location.`,
            })
        } else {
            advanceGameState()
        }
    }

    const updateSupplyCenters = (newUnits: Unit[]) => {
        const newPlayers = [...players]
        territories.forEach(territory => {
            if (territory.supplyCenter) {
                const occupyingUnit = newUnits.find(u => u.position === territory.id && !u.dislodged)
                if (occupyingUnit) {
                    const playerIndex = newPlayers.findIndex(p => p.id === occupyingUnit.countryId)
                    if (playerIndex !== -1) {
                        newPlayers[playerIndex].supplyCenters += 1
                    }
                }
            }
        })
        setPlayers(newPlayers)
    }

    const checkVictoryCondition = () => {
        const winner = players.find(p => p.supplyCenters >= VICTORY_CONDITION)
        if (winner) {
            setGameState(prevState => ({ ...prevState, winner }))
            setShowVictoryDialog(true)
        }
    }

    const advanceGameState = () => {
        setGameState(prevState => {
            let newState = { ...prevState }
            if (prevState.season === 'Spring') {
                newState.season = 'Fall'
            } else {
                newState.season = 'Spring'
                newState.year += 1
            }
            newState.phase = 'order'
            return newState
        })
        setCurrentPlayerIndex(0)
        // Reset dislodged and mustRetreat flags
        setUnits(prevUnits => prevUnits.map(u => ({ ...u, dislodged: false, mustRetreat: false })))
    }

    const endTurn = () => {
        if (gameState.phase === 'retreat') {
            const unitsStillRetreating = units.filter(u => u.mustRetreat)
            if (unitsStillRetreating.length > 0) {
                toast({
                    title: "Incomplete Retreats",
                    description: "All dislodged units must retreat or be disbanded before ending the turn.",
                    variant: "destructive",
                })
                return
            }
        }

        if (currentPlayerIndex === players.length - 1) {
            if (gameState.phase === 'order') {
                setGameState(prevState => ({ ...prevState, phase: 'resolution' }))
            } else if (gameState.phase === 'retreat') {
                advanceGameState()
            }
        } else {
            setCurrentPlayerIndex(prevIndex => prevIndex + 1)
        }
    }

    const cancelOrder = (orderIndex: number) => {
        setOrders(prevOrders => prevOrders.filter((_, index) => index !== orderIndex))
    }

    const handleRetreat = (unitId: string, targetTerritoryId: string) => {
        const unit = units.find(u => u.id === unitId)
        if (unit && unit.mustRetreat) {
            const targetTerritory = territories.find(t => t.id === targetTerritoryId)
            if (targetTerritory && targetTerritory.adjacentTo.includes(unit.position)) {
                setUnits(prevUnits => prevUnits.map(u =>
                    u.id === unitId ? { ...u, position: targetTerritoryId, mustRetreat: false, dislodged: false } : u
                ))
                toast({
                    title: "Unit Retreated",
                    description: `${unit.type} retreated from ${unit.position} to ${targetTerritoryId}`,
                })
            } else {
                toast({
                    title: "Invalid Retreat",
                    description: "Units can only retreat to adjacent unoccupied territories.",
                    variant: "destructive",
                })
            }
        }
    }

    const disbandUnit = (unitId: string) => {
        setUnits(prevUnits => prevUnits.filter(u => u.id !== unitId))
        toast({
            title: "Unit Disbanded",
            description: "The dislodged unit has been removed from the game.",
        })
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
        <div className="flex h-screen">
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
                                <svg viewBox="0 0 300 200" className="w-full h-full">
                                    {territories.map((territory) => (
                                        <g key={territory.id}>
                                            <path
                                                d={territory.path}
                                                fill={territory.type === 'land' ? '#f0e68c' : '#add8e6'}
                                                stroke="black"
                                                strokeWidth="1"
                                                onClick={() => handleTerritoryClick(territory)}
                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                            <text
                                                x={territory.center?.split(',')[0]}
                                                y={territory.center?.split(',')[1]}
                                                textAnchor="middle"
                                                fontSize="8"
                                                fill="black"
                                            >
                                                {territory.name}
                                            </text>
                                            {territory.supplyCenter && (
                                                <circle
                                                    cx={territory.center?.split(',')[0]}
                                                    cy={territory.center?.split(',')[1]}
                                                    r="3"
                                                    fill="red"
                                                />
                                            )}
                                            {units.filter(unit => unit.position === territory.id).map((unit, index) => (
                                                <g key={unit.id}>
                                                    <circle
                                                        cx={Number(territory.center?.split(',')[0]) + index * 5}
                                                        cy={Number(territory.center?.split(',')[1]) + 5}
                                                        r="3"
                                                        fill={players.find(p => p.id === unit.countryId)?.color || 'gray'}
                                                        stroke={unit.dislodged ? "red" : "black"}
                                                        strokeWidth={unit.dislodged ? "1.5" : "0.5"}
                                                    />
                                                    {unit.countryId === players[currentPlayerIndex].id && (
                                                        <circle
                                                            cx={Number(territory.center?.split(',')[0]) + index * 5}
                                                            cy={Number(territory.center?.split(',')[1]) + 5}
                                                            r="4"
                                                            fill="none"
                                                            stroke="yellow"
                                                            strokeWidth="1"
                                                        />
                                                    )}
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
                <Card>
                    <CardHeader>
                        <CardTitle>Game Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-2">Year: {gameState.year}</p>
                        <p className="mb-2">Season: {gameState.season}</p>
                        <p className="mb-2">Phase: {gameState.phase}</p>
                        <p className="mb-4">Current Player: {players[currentPlayerIndex].name}</p>
                        {players.map(player => (
                            <p key={player.id} className="mb-2">{player.name}: {player.supplyCenters} supply centers</p>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Selected Territory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedTerritory ? (
                            <div>
                                <h3 className="text-lg font-bold mb-2">{selectedTerritory.name}</h3>
                                <p className="mb-4">Type: {selectedTerritory.type}</p>
                                <p className="mb-4">Units in this territory:</p>
                                <Select onValueChange={handleUnitSelect}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.filter(unit =>
                                            unit.position === selectedTerritory.id &&
                                            unit.countryId === players[currentPlayerIndex].id &&
                                            (gameState.phase !== 'retreat' || unit.mustRetreat)
                                        ).map(unit => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.type} ({unit.countryId}) {unit.dislodged ? '(Dislodged)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedUnit && (
                                    <div className="mt-4">
                                        {gameState.phase === 'order' ? (
                                            <>
                                                <RadioGroup defaultValue="move" onValueChange={(value) => setActionType(value as 'move' | 'support' | 'convoy')}>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="move" id="move" />
                                                        <Label htmlFor="move">Move</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="support" id="support" />
                                                        <Label htmlFor="support">Support</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="convoy" id="convoy" />
                                                        <Label htmlFor="convoy">Convoy</Label>
                                                    </div>
                                                </RadioGroup>
                                                <p className="mt-2 mb-2">{actionType.charAt(0).toUpperCase() + actionType.slice(1)} {selectedUnit.type} to:</p>
                                                <div className="space-y-2">
                                                    {territories.filter(t => t.id !== selectedTerritory.id && selectedTerritory.adjacentTo.includes(t.id) &&
                                                        (selectedUnit.type === 'fleet' ? t.type === 'sea' : true)
                                                    ).map(territory => (
                                                        <Button
                                                            key={territory.id}
                                                            className="w-full"
                                                            onClick={() => handleAction(territory.id)}
                                                        >
                                                            {territory.name}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : gameState.phase === 'retreat' ? (
                                            <>
                                                <p className="mt-2 mb-2">Retreat {selectedUnit.type} to:</p>
                                                <div className="space-y-2">
                                                    {territories.filter(t =>
                                                        t.id !== selectedTerritory.id &&
                                                        selectedTerritory.adjacentTo.includes(t.id) &&
                                                        !units.some(u => u.position === t.id && !u.dislodged) &&
                                                        (selectedUnit.type === 'fleet' ? t.type === 'sea' : true)
                                                    ).map(territory => (
                                                        <Button
                                                            key={territory.id}
                                                            className="w-full"
                                                            onClick={() => handleRetreat(selectedUnit.id, territory.id)}
                                                        >
                                                            {territory.name}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <Button
                                                    className="w-full mt-4"
                                                    variant="destructive"
                                                    onClick={() => disbandUnit(selectedUnit.id)}
                                                >
                                                    Disband Unit
                                                </Button>
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>Select a territory to view information and actions.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Review Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            {orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <div key={index} className="flex justify-between items-center mb-2">
                                        <span>
                                            {order.type.charAt(0).toUpperCase() + order.type.slice(1)} from {order.from} to {order.to}
                                        </span>
                                        <Button variant="destructive" size="sm" onClick={() => cancelOrder(index)}>
                                            Cancel
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p>No orders issued yet.</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Button className="w-full" onClick={endTurn}>End Turn</Button>
            </div>
            <Dialog open={showVictoryDialog} onOpenChange={setShowVictoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Victory!</DialogTitle>
                        <DialogDescription>
                            {gameState.winner?.name} has won the game by controlling {VICTORY_CONDITION} supply centers!
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}