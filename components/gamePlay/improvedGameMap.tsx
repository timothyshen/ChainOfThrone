"use client"

import { useRef } from "react"
import { Sword, Crown, Users, Navigation, Flag } from "lucide-react"
import { Army, Territory } from "@/lib/types/game"
import {
    BattleState,
    BattleEffect,
    ArmyPosition,
} from "@/lib/types/advancedGame"

interface ImprovedGameMapProps {
    // Territory props
    territories: Territory[][]
    selectedTerritory: Territory | null
    onTerritoryClick: (territory: Territory) => void
    currentPlayer: string

    // Army props
    armies: Army[]
    selectedArmy: Army | null
    onArmyClick: (territory: Territory, army: Army) => void
    animatingArmies: Set<string>
    armyPositions: Record<string, ArmyPosition>
    getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }

    // Movement props
    movementMode: boolean
    showMovementPaths: boolean
    cancelMovement: () => void

    isMobile: boolean
    mobileBottomPanelOpen: boolean
    validMovementCells: { x: number; y: number }[]
}

export default function GameMap({
    territories: territoriesProps,
    selectedTerritory,
    onTerritoryClick,
    currentPlayer,
    armies,
    selectedArmy,
    onArmyClick,
    animatingArmies,
    armyPositions,
    getArmyDisplayPosition,
    movementMode,
    showMovementPaths,
    validMovementCells,
    cancelMovement,
    isMobile,
    mobileBottomPanelOpen,
}: ImprovedGameMapProps) {
    // Convert 2D territories to flat array with selection state  
    const territories = territoriesProps.flat().map(territory => ({
        ...territory,
        isSelected: selectedTerritory?.id === territory.id
    }));

    const mapRef = useRef<HTMLDivElement>(null)


    const getTerritoryIcon = (isCastle: boolean) => {
        switch (isCastle) {
            case true:
                return <Crown className="w-3 h-3 md:w-4 md:h-4" />

            default:
                return <Flag className="w-3 h-3 md:w-4 md:h-4" />
        }
    }


    const calculateBattleOdds = (attacker: Army, defender: Army | Territory) => {
        const attackerStrength = attacker.size
        let defenderStrength = "size" in defender ? defender.size : Number(defender.units.reduce((acc, curr) => acc + Number(curr), 0)) * 10

        // Add fortification bonus for castles and strongholds
        if ("isCastle" in defender && defender.isCastle) {
            const fortificationBonus = defender.isCastle ? 2.5 : 2.0
            defenderStrength *= fortificationBonus
        }

        const attackerOdds = attackerStrength / (attackerStrength + defenderStrength)
        const defenderOdds = 1 - attackerOdds

        return { attackerOdds, defenderOdds }
    }

    const animateBattle = (battle: BattleState) => {
        const startTime = Date.now()
        const battleDuration = 3000 // 3 seconds

        const battleInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / battleDuration, 1)

            // Calculate casualties
            const { attackerOdds } = calculateBattleOdds(
                battle.attackerArmy,
                battle.defenderArmy || battle.defenderTerritory!,
            )
            const attackerDamage = Math.floor(progress * (1 - attackerOdds) * 100)
            const defenderDamage = Math.floor(progress * attackerOdds * 80)

            // Add battle effects
            if (Math.random() < 0.3) {
                addBattleEffect(battle, "clash")
            } else if (Math.random() < 0.1) {
                addBattleEffect(battle, "explosion")
            }

            setActiveBattle((prev) =>
                prev
                    ? {
                        ...prev,
                        progress,
                        attackerDamage,
                        defenderDamage,
                    }
                    : null,
            )

            if (progress >= 1) {
                clearInterval(battleInterval)
                completeBattle(battle, attackerOdds)
            }
        }, 100)
    }

    const addBattleEffect = (battle: BattleState, type: "clash" | "explosion") => {
        const attackerPos = getArmyDisplayPosition(battle.attackerArmy)
        const defenderPos = battle.defenderArmy
            ? getArmyDisplayPosition(battle.defenderArmy)
            : { gridX: battle.defenderTerritory!.x, gridY: battle.defenderTerritory!.y }

        const effect: BattleEffect = {
            id: `battle_effect_${Date.now()}_${Math.random()}`,
            type: type,
            x: (attackerPos.gridX + defenderPos.gridX) / 2,
            y: (attackerPos.gridY + defenderPos.gridY) / 2,
            timestamp: Date.now(),
        }

        setBattleEffects((prev) => [...prev, effect])

        // Remove effect after animation
        setTimeout(
            () => {
                setBattleEffects((prev) => prev.filter((e) => e.id !== effect.id))
            },
            type === "clash" ? 800 : 1200,
        )
    }

    const completeBattle = (battle: BattleState, attackerOdds: number) => {
        const winner = Math.random() < attackerOdds ? "attacker" : "defender"

        // Add final effect
        const finalEffect: BattleEffect = {
            id: `battle_final_${Date.now()}`,
            type: "victory",
            x: battle.defenderArmy ? battle.defenderArmy.gridX : battle.defenderTerritory!.x,
            y: battle.defenderArmy ? battle.defenderArmy.gridY : battle.defenderTerritory!.y,
            timestamp: Date.now(),
        }

        setBattleEffects((prev) => [...prev, finalEffect])

        setActiveBattle((prev) =>
            prev
                ? {
                    ...prev,
                    winner,
                    phase: "results",
                }
                : null,
        )

        setTimeout(() => {
            applyBattleResults(battle, winner)
            setMobileBottomPanelOpen(false)
        }, 2000)
    }

    const applyBattleResults = (battle: BattleState, winner: "attacker" | "defender") => {
        if (winner === "attacker") {
            console.log(`${battle.attackerArmy.owner} won the battle!`)
        } else {
            console.log(`${battle.attackerArmy.owner} was defeated!`)
        }

        setTimeout(() => {
            setActiveBattle(null)
            setBattleEffects([])
        }, 1000)
    }

    const startBattle = (attacker: Army, target: Army | Territory) => {
        const battleId = `battle_${Date.now()}`

        // Check if target is a fortified position

        const battle: BattleState = {
            id: battleId,
            attackerArmy: attacker,
            defenderArmy: "size" in target ? target : undefined,
            defenderTerritory: "units" in target ? target : undefined,
            isActive: true,
            progress: 0,
            attackerDamage: 0,
            defenderDamage: 0,
            winner: null,
            phase: "combat",
        }

        setActiveBattle(battle)
        setShowBattlePreview(false)
        setBattleTarget(null)
        animateBattle(battle)
    }





    return (
        <div
            className="h-max bg-slate-900 text-white flex flex-col md:flex-row"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setSelectedArmy(null)
                    setSelectedTerritory(null)
                    cancelMovement()
                }
            }}
        >
            {/* Main Map Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Map Canvas */}
                <div
                    ref={mapRef}
                    className="w-full bg-gradient-to-br from-slate-800 to-slate-900"
                    style={{
                        transform: `scale(1)`,
                        transformOrigin: "center center",
                        height: isMobile && mobileBottomPanelOpen
                            ? 'calc(100vh - 50vh)' // Reserve space for mobile panel
                            : 'calc(100vh - 200px)', // Reserve space for headers/navigation
                        maxWidth: '100%',
                        maxHeight: 'calc(100vh - 200px)', // Constrain max height
                        minHeight: '400px', // Ensure minimum usable size
                        margin: '0 auto'
                    }}
                >
                    {/* 3x3 Grid Background */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 ">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <div key={index} className="border border-slate-600/30 rounded-lg bg-slate-800/20" />
                        ))}
                    </div>

                    {/* Territories in Grid */}
                    <div className="absolute inset-0 p-2 rounded-lg">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                            {territories.map((territory) => {
                                return (
                                    <div
                                        key={territory.id}
                                        className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-slate-700/50 ${selectedTerritory?.id === territory.id
                                            ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                                            : "border-slate-600"
                                            }`}
                                        style={{
                                            minHeight: isMobile ? "80px" : "120px",
                                        }}
                                        onClick={() => handleTerritoryClick(territory)}
                                    >
                                        <div className="p-2 md:p-3 h-full flex flex-col justify-between">
                                            <div className="flex items-center gap-1">
                                                {getTerritoryIcon(territory.isCastle)}
                                                <span className="text-xs md:text-sm font-bold truncate">{territory.name}</span>
                                            </div>
                                            <div className="text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Sword className="w-3 h-3" />
                                                    <span>{territory.units.reduce((acc, curr) => acc + Number(curr), 0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Army on Territory */}

                                        {armies
                                            .filter((army) => {
                                                const displayPos = getArmyDisplayPosition(army)
                                                return displayPos.gridX === territory.x && displayPos.gridY === territory.y
                                            })
                                            .map((army) => {
                                                const isAnimating = animatingArmies.has(army.id)
                                                const displayPos = getArmyDisplayPosition(army)

                                                return (
                                                    <div
                                                        key={army.id}
                                                        className={`absolute top-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-800 ease-in-out ${selectedArmy?.id === army.id
                                                            ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                                                            : "border-white"
                                                            } ${army.isMoving || isAnimating ? "animate-pulse" : ""} ${isAnimating ? "scale-110 shadow-lg" : "hover:scale-110"
                                                            }`}
                                                        style={{
                                                            backgroundColor: "#9B9B9B",
                                                            transform: isAnimating ? "translateZ(0)" : undefined,
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (!isAnimating) {
                                                                handleArmyClick(army)
                                                            }
                                                        }}
                                                    >
                                                        <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs bg-slate-800 px-1 rounded whitespace-nowrap">
                                                            {army.size}
                                                        </div>

                                                        {/* Movement Trail Effect */}
                                                        {isAnimating && (
                                                            <>
                                                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                                                                <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse" />
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Floating Animated Armies */}

                    {armies
                        .filter((army) => animatingArmies.has(army.id))
                        .map((army) => {
                            const startPos = { x: army.x, y: army.y }
                            const endPos = armyPositions[army.id]

                            return (
                                <div
                                    key={`floating-${army.id}`}
                                    className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/50 z-10"
                                    style={{
                                        backgroundColor: "#9B9B9B",
                                        left: `${startPos.gridX * 33.333 + 16.666}%`,
                                        top: `${startPos.gridY * 33.333 + 16.666}%`,
                                        transform: "translate(-50%, -50%)",
                                        animation: `moveArmy-${army.id} 0.8s ease-in-out forwards`,
                                    }}
                                >
                                    <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />

                                    {/* Trail Effect */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

                                    {/* Movement Particles */}
                                    <div className="absolute -inset-2">
                                        <div
                                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                                            style={{ top: "10%", left: "20%", animationDelay: "0ms" }}
                                        />
                                        <div
                                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                                            style={{ top: "80%", right: "15%", animationDelay: "200ms" }}
                                        />
                                        <div
                                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                                            style={{ bottom: "20%", left: "70%", animationDelay: "400ms" }}
                                        />
                                    </div>
                                </div>
                            )
                        })}

                    {/* Dynamic CSS for movement animations */}
                    <style jsx>{`
                ${armies
                            .filter((army) => animatingArmies.has(army.id))
                            .map((army) => {
                                const startPos = { gridX: army.gridX, gridY: army.gridY }
                                const endPos = armyPositions[army.id]

                                return `
                      @keyframes moveArmy-${army.id} {
                        0% {
                          left: ${startPos.gridX * 33.333 + 16.666}%;
                          top: ${startPos.gridY * 33.333 + 16.666}%;
                          transform: translate(-50%, -50%) scale(1);
                          opacity: 1;
                        }
                        50% {
                          transform: translate(-50%, -50%) scale(1.2);
                          opacity: 0.9;
                        }
                        100% {
                          left: ${endPos?.gridX ? endPos.gridX * 33.333 + 16.666 : 50}%;
                          top: ${endPos?.gridY ? endPos.gridY * 33.333 + 16.666 : 50}%;
                          transform: translate(-50%, -50%) scale(1);
                          opacity: 1;
                        }
                      }
                    `
                            })
                            .join("\n")}
              `}</style>

                    {/* Movement Path Overlays */}
                    {showMovementPaths && movementMode && (
                        <div className="absolute inset-0 p-4 pointer-events-none">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                                {Array.from({ length: 9 }).map((_, index) => {
                                    const gridX = index % 3
                                    const gridY = Math.floor(index / 3)
                                    const isValidMove = validMovementCells.some((cell) => cell.x === gridX && cell.y === gridY)
                                    const isCurrentPosition = selectedArmy && selectedArmy.gridX === gridX && selectedArmy.gridY === gridY

                                    return (
                                        <div
                                            key={index}
                                            className={`relative flex items-center justify-center pointer-events-auto cursor-pointer transition-all duration-200 ${isValidMove ? "bg-green-500/30 border-2 border-green-400 rounded-lg hover:bg-green-500/50" : ""
                                                } ${isCurrentPosition ? "bg-blue-500/30 border-2 border-blue-400 rounded-lg" : ""}`}
                                            onClick={() => (isValidMove ? handleMoveToCell(gridX, gridY) : null)}
                                        >
                                            {isValidMove && (
                                                <div className="flex flex-col items-center">
                                                    <Navigation className="w-6 h-6 md:w-8 md:h-8 text-green-400 animate-pulse" />
                                                    <span className="text-xs text-green-400 font-bold mt-1">MOVE</span>
                                                </div>
                                            )}
                                            {isCurrentPosition && (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-400 animate-ping" />
                                                    <span className="text-xs text-blue-400 font-bold mt-1">CURRENT</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    )
}
