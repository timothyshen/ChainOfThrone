'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Flag, Users, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Territory, Player, InitialPlayers } from '@/lib/types/game'
import GameStatus from '@/components/gamePlay/GameStatus/GameStatus'
import ChatSystem from '@/components/gamePlay/ChatSystem'
import GameMap from '@/components/gamePlay/GameMap'
import { get2DGrid, addressToId, getMaxPlayer, totalPlayers, getGameStatus, getRoundSubmitted, idToAddress } from '@/lib/hooks/ReadGameContract'
import { useAccount } from 'wagmi'
import { useMakeMove } from '@/lib/hooks/useMakeMove'
import { useGameAddress } from '@/lib/hooks/useGameAddress'
import { useGameStateUpdates } from '@/lib/hooks/useGameStateUpdates'
import { useWatchContractEvent } from "wagmi";
import { gameAbi } from '@/lib/contract/gameAbi'
import { PlayerState } from '@/lib/types/gameStatus'
import { GameStatusEnum } from '@/lib/types/gameStatus'
import { Spinner } from '../ui/spinner'
import { motion, AnimatePresence } from "framer-motion"


const getGameStatusText = (status: number): GameStatusEnum => {
    switch (status) {
        case 0:
            return GameStatusEnum.NOT_STARTED;
        case 1:
            return GameStatusEnum.ONGOING;
        case 2:
            return GameStatusEnum.COMPLETED;
        default:
            return GameStatusEnum.NOT_STARTED;
    }
}


export default function DiplomacyGame({ gameAddressParam }: { gameAddressParam: `0x${string}` }) {
    const { gameAddress } = useGameAddress();
    const { gameState, gameStatusLoading, error, refreshGameState } = useGameStateUpdates(gameAddressParam);
    const [gameStatus, setGameStatus] = useState<GameStatusEnum>(GameStatusEnum.NOT_STARTED);
    const [totalPlayer, setTotalPlayer] = useState<number>(0);
    const [maxPlayer, setMaxPlayer] = useState<number>(0);
    const [playerAddresses, setPlayerAddresses] = useState<PlayerState[]>([]);
    const [territories, setTerritories] = useState<Territory[][]>([])
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
    const [currentUnits, setCurrentUnits] = useState<number>(0)
    const [moveStrength, setMoveStrength] = useState<number>(0)
    const [players, setPlayers] = useState<Player[]>(InitialPlayers)
    const [executionRecord, setExecutionRecord] = useState<string[]>([])
    const [moveSubmitted, setMoveSubmitted] = useState<boolean>(false)
    const [playerId, setPlayerId] = useState<string | null>(null)
    const [isGridLoading, setIsGridLoading] = useState(true)
    const [isStatusLoading, setIsStatusLoading] = useState(true)
    const [moveAction, setMoveAction] = useState<Territory | null>(null)
    const { toast } = useToast()
    const { address } = useAccount()
    const { makeMove, error: makeMoveError, isConfirmed: isMoveConfirmed, isConfirming: isMoveConfirming } = useMakeMove()

    useWatchContractEvent({
        address: gameAddressParam,
        abi: gameAbi,
        eventName: 'RoundCompleted',
        onLogs: () => {
            getGrids();
            getPlayerId();
            fetchGameData();
            toast({
                title: "Round Completed",
                description: `Round has been completed`,
            });
        },
    });

    useWatchContractEvent({
        address: gameAddressParam,
        abi: gameAbi,
        eventName: "MoveSubmitted",
        onLogs() {
            fetchGameData();
            toast({
                title: "Move Submitted",
                description: "A move has been submitted",
            });
        },
    });

    useWatchContractEvent({
        address: gameAddressParam,
        abi: gameAbi,
        eventName: "PlayerAdded",
        onLogs() {
            fetchGameData();
        },
    });

    useWatchContractEvent({
        address: gameAddressParam,
        abi: gameAbi,
        eventName: "GameStarted",
        onLogs() {
            getGrids();
            getPlayerId();
            toast({
                title: "Game Started",
                description: "The game has begun!",
            });
        },
    });


    const getGrids = useCallback(async () => {
        setIsGridLoading(true)
        try {
            if (!gameAddress) return;
            const gridData = await get2DGrid(gameAddress);
            if (!gridData) return;
            const newGridData = (gridData as any[][]).map((row: any[], rowIndex: number) =>
                row.map((territory: any, colIndex: number) => ({
                    ...territory,
                    x: rowIndex,
                    y: colIndex,
                }))
            );
            setTerritories(newGridData as Territory[][]);
        } catch (error) {
            console.error('Error fetching grid:', error);
            toast({
                title: "Error",
                description: "Failed to fetch game state",
                variant: "destructive",
            });
        } finally {
            setIsGridLoading(false)
        }
    }, [gameAddress, toast]);

    const getPlayerId = useCallback(async () => {
        if (!gameAddress || !address) return;
        const playerId = await addressToId(gameAddress, address);
        setPlayerId(playerId as string);
    }, [gameAddress, address]);

    const fetchGameData = useCallback(async () => {
        setIsStatusLoading(true)
        try {
            if (!gameAddress) return;
            const [status, total, max] = await Promise.all([
                getGameStatus(gameAddress),
                totalPlayers(gameAddress),
                getMaxPlayer(gameAddress)
            ]);

            setGameStatus(getGameStatusText(status as number));
            setTotalPlayer(total as number);
            setMaxPlayer(max as number);

            if (total as number > 0) {
                const addresses = await Promise.all(
                    Array.from({ length: 2 }, (_, i) =>
                        Promise.all([
                            idToAddress(gameAddress, i),
                            getRoundSubmitted(gameAddress, i)
                        ])
                    )
                );

                setPlayerAddresses(addresses.map(([address, roundSubmitted]) => ({
                    address: address as string,
                    roundSubmitted: roundSubmitted as boolean
                })));
            }
            console.log(status, total, max);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch game data",
                variant: "destructive",
            });
        } finally {
            setIsStatusLoading(false);
        }
    }, [gameAddress, toast]);

    useEffect(() => {
        getGrids();
        getPlayerId();
        fetchGameData();
    }, [getGrids, getPlayerId, fetchGameData]);



    const handleTerritoryClick = (territory: Territory) => {
        if (territory.player !== address) {
            toast({
                title: "Invalid Selection",
                description: "You can only select territories that belong to you",
                variant: "destructive",
            });
            return;
        }
        console.log("Territory clicked:", territory);

        setSelectedTerritory(territory);
        setMoveStrength(0);
        setCurrentUnits(Number(territory.units[Number(playerId)]));
    }

    const getAdjacentTerritories = (territory: Territory): Territory[] => {
        if (!territory) return [];
        const adjacentTerritories: Territory[] = [];

        territories.forEach((row, i) => {
            if (!row) return;
            row.forEach((currentTerritory, j) => {
                if (!currentTerritory) return;

                const dx = Math.abs(territory.x - currentTerritory.x);
                const dy = Math.abs(territory.y - currentTerritory.y);
                if (dx + dy === 1) {
                    adjacentTerritories.push(currentTerritory);
                }
            });
        });

        return adjacentTerritories;
    };

    const handleAction = async (targetTerritory: Territory) => {
        setMoveAction(targetTerritory)
        if (!selectedTerritory || !address || !gameAddress) {
            toast({
                title: "Invalid Action",
                description: "Cannot perform this action at this time.",
                variant: "destructive",
            });
            return;
        }

        try {
            type Move = readonly [number, number, string, number, number, number];
            const move: Move = [
                selectedTerritory.x,
                selectedTerritory.y,
                address,
                targetTerritory.x,
                targetTerritory.y,
                moveStrength
            ] as const;

            await makeMove(gameAddress, move);


        } catch (error) {
            console.error('Error making move:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit move to the blockchain",
                variant: "destructive",
            });
        }
    };

    if (makeMoveError) {
        console.error("Error making move:", makeMoveError);
    }

    const handleSendMessage = (recipientId: string, content: string) => {
        console.log(`Message sent to ${recipientId}: ${content}`)
        toast({
            title: "Message Sent",
            description: `Your message has been sent to ${players.find(p => p.id === recipientId)?.name}.`,
        })
    }


    if (isMoveConfirming) {
        toast({
            title: "Move Submitting",
            description:
                <div className="flex items-center">
                    <Spinner className="mr-2" />
                    Moving units...
                </div>,
        });
    }

    if (isMoveConfirmed) {
        getGrids();
        getPlayerId();
        fetchGameData();
        setMoveSubmitted(true);
        toast({
            title: "Move Submitted",
            description: "Your move has been submitted to the blockchain",
        });
        setMoveStrength(0);
    }

    return (
        <div className="flex flex-col min-h-screen mt-12">
            <div className="flex flex-1 h-[calc(100vh-2rem)]">
                <div className="flex-1 p-4 overflow-auto">
                    <Tabs defaultValue="map" className="w-full h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="map">Game Map</TabsTrigger>
                            {/* <TabsTrigger value="chat">Diplomacy Chat</TabsTrigger> */}
                        </TabsList>
                        <TabsContent value="map" className="flex-1">
                            <GameMap
                                currentPlayer={address ?? ''}
                                territories={territories}
                                onTerritoryClick={handleTerritoryClick}
                                isLoading={isGridLoading}
                            />
                        </TabsContent>
                        <TabsContent value="chat" className="flex-1">
                            <ChatSystem
                                players={players}
                                currentPlayerId={address ?? ''}
                                onSendMessage={handleSendMessage}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="w-1/3 p-4 space-y-4 overflow-auto">
                    <GameStatus
                        isLoading={isStatusLoading}
                        currentPlayer={address ?? ''}
                        gameStatus={gameStatus}
                        totalPlayer={totalPlayer}
                        maxPlayer={maxPlayer}
                        playerAddresses={playerAddresses}
                        setGameStatus={setGameStatus}
                        setTotalPlayer={setTotalPlayer}
                        fetchGameData={fetchGameData} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Flag className="h-6 w-6" />
                                Territory Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedTerritory ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-muted p-4 space-y-3">
                                        <p>Location: ({selectedTerritory.x}, {selectedTerritory.y})</p>                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span className="font-medium">Location:</span>
                                            <span>({selectedTerritory.x}, {selectedTerritory.y})</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Flag className="h-4 w-4" />
                                            <span className="font-medium">Type:</span>
                                            <span className="flex items-center gap-1">
                                                {selectedTerritory.isCastle ? '🏰 Castle' : '🗺️ Land'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span className="font-medium">Current Units:</span>
                                            <span>{currentUnits}</span>
                                        </div>
                                    </div>

                                    {gameStatus === GameStatusEnum.ONGOING && !moveSubmitted ? (
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="moveStrength">Units to Move:</Label>
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        id="moveStrength"
                                                        type="number"
                                                        min={1}
                                                        value={moveStrength}
                                                        max={currentUnits}
                                                        onChange={(e) => setMoveStrength(Number(e.target.value))}
                                                        className="w-full"
                                                        disabled={moveSubmitted}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-md font-medium">Adjacent Territories</h3>
                                                <AnimatePresence>
                                                    {!isMoveConfirming ? (
                                                        <motion.div
                                                            className="space-y-2"
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                        >
                                                            {getAdjacentTerritories(selectedTerritory).map(territory => (
                                                                <Button
                                                                    key={`${territory.x}-${territory.y}`}
                                                                    className={`w-full `}
                                                                    onClick={() => handleAction(territory)}
                                                                    disabled={!moveStrength || moveStrength <= 0 || moveSubmitted}
                                                                >
                                                                    Move to ({territory.x}, {territory.y})
                                                                    {isMoveConfirming && <Spinner className="ml-2 h-4 w-4" />}
                                                                </Button>
                                                            ))}
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex flex-col items-center justify-center gap-4 py-8"
                                                        >
                                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                            <p className="text-sm text-muted-foreground">
                                                                Moving {moveStrength} units to ({moveAction?.x}, {moveAction?.y})...
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-muted">
                                            {gameStatus !== GameStatusEnum.ONGOING ? (
                                                <p>Game is not currently active</p>
                                            ) : (
                                                <p>You have already submitted your move for this round</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-muted-foreground">Select a territory to view information and perform actions</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}