'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Territory, Player, InitialPlayers, Army } from '@/lib/types/game'
import {
    BattleState,
    BattleEffect,
    SiegeState,
    SiegeEffect,
    TerritoryState,
    ActivePanel,
    ArmyPosition,
    BattleTarget
} from '@/lib/types/advancedGame'
import GameStatus from '@/components/gamePlay/GameStatus/GameStatus'
import ImprovedGameMap from '@/components/gamePlay/improvedGameMap'
import { get2DGrid, addressToId, getMaxPlayer, totalPlayers, getGameStatus, getRoundSubmitted, idToAddress } from '@/lib/hooks/ReadGameContract'
import { useAccount } from 'wagmi'
import { useMakeMove } from '@/lib/hooks/useMakeMove'
import { useGameAddress } from '@/lib/hooks/useGameAddress'
import { useWatchContractEvent } from "wagmi";
import { gameAbi } from '@/lib/contract/gameAbi'
import { PlayerState } from '@/lib/types/gameStatus'
import { GameStatusEnum } from '@/lib/types/gameStatus'
import { Spinner } from '../ui/spinner'
import { GameOverview } from './GameStatus/GameOverview'
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ChevronDown } from 'lucide-react'
import GameOperationPanel from '@/components/gamePlay/GameMap/GameOperationPanel'
import BattleEffectOverlay from '@/components/gamePlay/GameMap/BattleEffectOverlay'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts numeric game status to enum
 */
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DiplomacyGame({ gameAddressParam }: { gameAddressParam: `0x${string}` }) {

    // ========================================================================
    // HOOKS & EXTERNAL STATE
    // ========================================================================

    const { gameAddress } = useGameAddress();
    const { address } = useAccount();
    const { makeMove, error: makeMoveError, isConfirmed: isMoveConfirmed, isConfirming: isMoveConfirming } = useMakeMove();
    const { toast } = useToast();

    // ========================================================================
    // GAME STATE
    // ========================================================================

    // Core game status
    const [gameStatus, setGameStatus] = useState<GameStatusEnum>(GameStatusEnum.NOT_STARTED);
    const [totalPlayer, setTotalPlayer] = useState<number>(0);
    const [maxPlayer, setMaxPlayer] = useState<number>(0);
    const [playerAddresses, setPlayerAddresses] = useState<PlayerState[]>([]);
    const [players, setPlayers] = useState<Player[]>(InitialPlayers);
    const [playerId, setPlayerId] = useState<string | null>(null);

    // ========================================================================
    // LOADING STATES
    // ========================================================================

    const [isGridLoading, setIsGridLoading] = useState(true);
    const [isStatusLoading, setIsStatusLoading] = useState(true);

    // ========================================================================
    // TERRITORY & MOVEMENT STATE
    // ========================================================================

    // Territory management
    const [territories, setTerritories] = useState<Territory[][]>([]);
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

    // Movement mechanics
    const [currentUnits, setCurrentUnits] = useState<number>(0);
    const [moveStrength, setMoveStrength] = useState<number>(0);
    const [moveAction, setMoveAction] = useState<Territory | null>(null);
    const [moveSubmitted, setMoveSubmitted] = useState<boolean>(false);
    const [showMovementPaths, setShowMovementPaths] = useState(false);
    const [movementMode, setMovementMode] = useState(false);
    const [validMovementCells, setValidMovementCells] = useState<{ x: number; y: number }[]>([]);

    // ========================================================================
    // ADVANCED GAME STATE (ARMIES, BATTLES, SIEGES)
    // ========================================================================

    // Army management
    const [armies, setArmies] = useState<Army[]>([
        { id: "a1", x: 1, y: 0, size: 500, owner: "P1", isMoving: false },
        { id: "a2", x: 0, y: 1, size: 800, owner: "P2", isMoving: false },
    ]);
    const [selectedArmy, setSelectedArmy] = useState<Army | null>(null);
    const [animatingArmies, setAnimatingArmies] = useState<Set<string>>(new Set());
    const [armyPositions, setArmyPositions] = useState<Record<string, ArmyPosition>>({});

    // Battle system
    const [activeBattle, setActiveBattle] = useState<BattleState | null>(null);
    const [battleEffects, setBattleEffects] = useState<BattleEffect[]>([]);
    const [showBattlePreview, setShowBattlePreview] = useState(false);
    const [battleTarget, setBattleTarget] = useState<BattleTarget | null>(null);

    // ========================================================================
    // UI STATE
    // ========================================================================

    const [activePanel, setActivePanel] = useState<ActivePanel>("overview");
    const [isMobile, setIsMobile] = useState(false);
    const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false);

    // ========================================================================
    // CONTRACT EVENT LISTENERS
    // ========================================================================

    /**
     * Listen for round completion events
     */
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

    /**
     * Listen for move submission events
     */
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

    /**
     * Listen for player addition events
     */
    useWatchContractEvent({
        address: gameAddressParam,
        abi: gameAbi,
        eventName: "PlayerAdded",
        onLogs() {
            fetchGameData();
        },
    });

    /**
     * Listen for game start events
     */
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

    // ========================================================================
    // DATA FETCHING FUNCTIONS
    // ========================================================================

    /**
     * Fetch and update the game grid/territories
     */
    const getGrids = useCallback(async () => {
        setIsGridLoading(true)
        try {
            if (!gameAddress) return;
            const gridData = await get2DGrid(gameAddress);
            let armies: Army[] = [];
            if (!gridData) return;
            const newGridData = (gridData as any[][]).map((row: any[], rowIndex: number) =>
                row.map((territory: any, colIndex: number) => ({
                    ...territory,
                    x: rowIndex,
                    y: colIndex,
                }))
            );
            newGridData.map((row: any[], rowIndex: number) =>
                row.map((territory: any, colIndex: number) => (
                    territory.units.map((unit: any, index: number) => {
                        if (unit > 0) {
                            armies.push({
                                id: index.toString(),
                                x: rowIndex,
                                y: colIndex,
                                size: unit,
                                owner: territory.player,
                                isMoving: false,
                            });
                        }
                    })
                ))
            );
            console.log("newGridData", newGridData);
            console.log("armies", armies);
            setTerritories(newGridData as Territory[][]);
            setArmies(armies as Army[]);
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

    /**
     * Get the current player's ID from their address
     */
    const getPlayerId = useCallback(async () => {
        if (!gameAddress || !address) return;
        const playerId = await addressToId(gameAddress, address);
        setPlayerId(playerId as string);
    }, [gameAddress, address]);

    /**
     * Fetch comprehensive game data (status, players, etc.)
     */
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

    // ========================================================================
    // INITIALIZATION EFFECTS
    // ========================================================================

    /**
     * Initialize game data on component mount
     */
    useEffect(() => {
        getGrids();
        getPlayerId();
        fetchGameData();
    }, [getGrids, getPlayerId, fetchGameData]);

    /**
     * Initialize army positions for animations
     */
    useEffect(() => {
        const initialPositions = armies.reduce((acc, army) => ({
            ...acc,
            [army.id]: { x: army.x, y: army.y, isAnimating: false },
        }), {});
        setArmyPositions(initialPositions);
    }, [armies]);

    /**
     * Handle mobile/desktop responsive behavior
     */
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // ========================================================================
    // TERRITORY INTERACTION HANDLERS
    // ========================================================================

    /**
     * Handle territory selection and validation
     */
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
        setSelectedArmy(null);
        setMoveStrength(0);
        setCurrentUnits(Number(territory.units[Number(playerId)]));

        if (isMobile) {
            setMobileBottomPanelOpen(true);
        }
    }

    // ========================================================================
    // ARMY INTERACTION HANDLERS
    // ========================================================================

    /**
     * Get army display position (considering animations)
     */
    const getArmyDisplayPosition = (army: Army) => {
        const animatedPosition = armyPositions[army.id]
        if (animatedPosition && animatedPosition.isAnimating) {
            return { gridX: animatedPosition.x, gridY: animatedPosition.y }
        }
        return { gridX: army.x, gridY: army.y }
    }

    /**
     * Handle army selection and movement setup
     */
    const handleArmyClick = (territory: Territory, army: Army) => {
        if (territory.player !== address) {
            toast({
                title: "Invalid Selection",
                description: "You can only select territories that belong to you",
                variant: "destructive",
            });
            return;
        }
        console.log("territory", territory)
        console.log("army", army)
        setSelectedTerritory(territory)
        setSelectedArmy(army)
        setActivePanel("army")

        // Show movement paths for selected army
        // Note: Using army position to find territory, not passing army directly to getAdjacentTerritories
        const armyTerritory = territories[army.x]?.[army.y];
        if (armyTerritory) {
            const validCells = getAdjacentTerritories(armyTerritory)
            setValidMovementCells(validCells.map(t => ({ x: t.x, y: t.y })))
        }
        setShowMovementPaths(true)
        setMovementMode(true)

        if (isMobile) {
            setMobileBottomPanelOpen(true)
        }
    }

    /**
     * Cancel movement mode
     */
    const cancelMovement = () => {
        setMovementMode(false)
        setSelectedTerritory(null)
        setSelectedArmy(null)
        setShowMovementPaths(false)
        setValidMovementCells([])
        setMobileBottomPanelOpen(false)
    }

    // ========================================================================
    // TERRITORY UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Get all territories adjacent to a given territory
     */
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

    /**
     * Get valid movement cells for an army
     */
    const getValidMovementCells = (army: Army): { x: number; y: number }[] => {
        const armyTerritory = territories[army.x]?.[army.y];
        if (!armyTerritory) return [];
        return getAdjacentTerritories(armyTerritory).map(t => ({ x: t.x, y: t.y }));
    };

    /**
     * Get territory color based on owner
     */
    const getTerritoryColor = (owner: string): string => {
        // Simple color mapping - you can expand this
        const colors: Record<string, string> = {
            'P1': '#3B82F6', // Blue
            'P2': '#EF4444', // Red
            'P3': '#10B981', // Green
            'P4': '#F59E0B', // Yellow
        };
        return colors[owner] || '#6B7280'; // Default gray
    };

    // ========================================================================
    // MOVE SUBMISSION HANDLERS
    // ========================================================================

    /**
     * Handle move submission to blockchain
     * Flow: territory selection → destination selection → move submission
     */
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

    // ========================================================================
    // MOVE STATUS EFFECTS
    // ========================================================================

    const handleMoveToCell = async (targetTerritory: Territory) => {
        if (!selectedTerritory || !address || !gameAddress) {
            toast({
                title: "Invalid Action",
                description: "Cannot perform this action at this time.",
                variant: "destructive",
            });
            return;
        }

        if (selectedArmy && movementMode) {
            // Start animation
            setAnimatingArmies((prev) => new Set([...prev, selectedArmy.id]))

            // Update army position with animation flag
            setArmyPositions((prev) => ({
                ...prev,
                [selectedArmy.id]: { ...targetTerritory, isAnimating: true },
            }))

            // Wait for animation to complete
            setTimeout(async () => {
                // Clear animation state
                setAnimatingArmies((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(selectedArmy.id)
                    return newSet
                })

                setArmyPositions((prev) => ({
                    ...prev,
                    [selectedArmy.id]: { ...targetTerritory, isAnimating: false },
                }))

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

                // Clear movement mode
                setMovementMode(false)
                setShowMovementPaths(false)
                setValidMovementCells([])

                console.log(`Army ${selectedArmy.id} moved to (${targetTerritory.x}, ${targetTerritory.y})`)
            }, 800) // Animation duration
        }
    }
    // Handle move errors
    if (makeMoveError) {
        console.error("Error making move:", makeMoveError);
    }

    // Handle move confirmation states
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

    // ========================================================================
    // UI COMPONENTS
    // ========================================================================

    /**
     * Game status and player information panel
     */
    const GameStatusPanel = () => (
        <div className="w-full space-y-6 p-4">
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
            <GameOverview territories={[]} />
        </div>
    );

    /**
     * Territory information and action panel
     */
    const TerritoryInfoPanel = () => (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Territory Information</CardTitle>
            </CardHeader>
            <CardContent>
                {selectedTerritory ? (
                    <div>
                        <h3 className="text-lg font-bold mb-2">{selectedTerritory.name}</h3>
                        <p className="mb-2">Type: {selectedTerritory.isCastle ? 'castle' : 'land'}</p>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="moveStrength">Units to Move:</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="moveStrength"
                                        type="number"
                                        min={1}
                                        value={moveStrength ?? ''}
                                        max={currentUnits}
                                        onChange={(e) => setMoveStrength(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Select Destination:</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Current Location: ({selectedTerritory.x}, {selectedTerritory.y})
                                </p>
                                <div className="grid gap-2 mt-1">
                                    {getAdjacentTerritories(selectedTerritory).map(territory => (
                                        <Button
                                            key={`${territory.x}-${territory.y}`}
                                            className="w-full text-sm"
                                            onClick={() => handleAction(territory)}
                                            disabled={!moveStrength || moveStrength <= 0 || moveSubmitted}
                                        >
                                            {isMoveConfirmed ? `Making the move to ${territory.x}, ${territory.y}` : `Move ${moveStrength} units to ${territory.x}, ${territory.y}`}
                                            {isMoveConfirming && <span className="animate-pulse">...</span>}
                                        </Button>
                                    ))}
                                    {isMoveConfirming && <Spinner className="animate-pulse" />}
                                    {isMoveConfirmed && <Button>You have made the move to {moveAction?.x}, {moveAction?.y}</Button>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Select a territory to view information and perform actions.</p>
                )}
            </CardContent>
        </Card>
    );

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    return (
        <div className="flex flex-col min-h-screen md:mt-12 bg-slate-900" onClick={() => {
            setSelectedTerritory(null)
        }}>
            {/* Mobile status drawer */}
            <div className="md:hidden my-1 px-4">
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <span className="text-sm">Status</span>
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <GameStatusPanel />
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Main game layout */}
            <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-4rem)]">
                {/* Game map section */}
                <div className="p-4 overflow-auto md:flex-1 block">
                    {isGridLoading ? <Spinner /> : <ImprovedGameMap
                        // Territory props
                        territories={territories}
                        selectedTerritory={selectedTerritory}
                        onTerritoryClick={handleTerritoryClick}
                        currentPlayer={address ?? ''}

                        // Army props
                        armies={armies}
                        selectedArmy={selectedArmy}
                        onArmyClick={handleArmyClick}
                        animatingArmies={animatingArmies}
                        armyPositions={armyPositions}
                        getArmyDisplayPosition={getArmyDisplayPosition}

                        // Movement props
                        movementMode={movementMode}
                        showMovementPaths={showMovementPaths}
                        validMovementCells={validMovementCells}
                        cancelMovement={cancelMovement}
                        onMoveToCell={handleMoveToCell}

                        // Battle props
                        activeBattle={activeBattle}
                        setActiveBattle={setActiveBattle}
                        battleEffects={battleEffects}
                        setBattleEffects={setBattleEffects}
                        showBattlePreview={showBattlePreview}
                        setShowBattlePreview={setShowBattlePreview}
                        setBattleTarget={setBattleTarget}

                        // UI props
                        isMobile={isMobile}
                        mobileBottomPanelOpen={mobileBottomPanelOpen}
                        setMobileBottomPanelOpen={setMobileBottomPanelOpen}
                        setSelectedArmy={setSelectedArmy}
                        setSelectedTerritory={setSelectedTerritory}

                    />}
                </div>

                {mobileBottomPanelOpen && activePanel && <GameOperationPanel
                    selectedArmy={selectedArmy}
                    animatingArmies={animatingArmies}
                    movementMode={movementMode}
                    cancelMovement={cancelMovement}
                    activeBattle={activeBattle}
                    armies={armies}
                    territories={territories.flat()}
                    setBattleTarget={setBattleTarget}
                    setShowBattlePreview={setShowBattlePreview}
                    setValidMovementCells={setValidMovementCells}
                    setShowMovementPaths={setShowMovementPaths}
                    setMovementMode={setMovementMode}
                    getTerritoryColor={getTerritoryColor}
                    getValidMovementCells={getValidMovementCells}
                />}

                {/* Battle Effects Overlay */}
                {battleEffects.length > 0 && (
                    <BattleEffectOverlay battleEffects={battleEffects} />
                )}

                {/* Desktop side panel */}
                <div className="hidden md:block md:w-1/3 p-4 space-y-4 overflow-auto">
                    <GameStatusPanel />
                </div>
            </div>
        </div>
    )
}