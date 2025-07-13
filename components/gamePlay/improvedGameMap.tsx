"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Map, Sword, Shield, Crown, Users, Settings, Navigation, Home, Flag, Menu, ChevronDown } from "lucide-react"

interface Territory {
    id: string
    name: string
    gridX: number
    gridY: number
    owner: string
    strength: number
    resources: number
    type: "castle" | "city" | "village" | "stronghold"
    isSelected: boolean
}

interface Army {
    id: string
    gridX: number
    gridY: number
    size: number
    owner: string
    isMoving: boolean
}

interface BattleState {
    id: string
    attackerArmy: Army
    defenderArmy?: Army
    defenderTerritory?: Territory
    isActive: boolean
    progress: number
    attackerDamage: number
    defenderDamage: number
    winner: "attacker" | "defender" | null
    phase: "preview" | "combat" | "results"
}

interface BattleEffect {
    id: string
    type: "clash" | "explosion" | "damage" | "victory"
    x: number
    y: number
    timestamp: number
}

interface SiegeState extends BattleState {
    siegePhase: "approach" | "setup" | "bombardment" | "assault" | "breach" | "capture"
    wallIntegrity: number
    siegeEquipment: string[]
    defenseBonus: number
    siegeDuration: number
}

interface SiegeEffect extends BattleEffect {
    type: "catapult" | "battering_ram" | "wall_damage" | "fire" | "breach" | "victory" | "clash" | "explosion" | "damage"
    projectile?: boolean
    startX?: number
    startY?: number
    endX?: number
    endY?: number
}

export default function GameMap() {
    // 3x3 Grid territories (9 total)
    const territories: Territory[] = [
        {
            id: "1",
            name: "Winterfell",
            gridX: 0,
            gridY: 0,
            owner: "Stark",
            strength: 85,
            resources: 1200,
            type: "castle",
            isSelected: false,
        },
        {
            id: "2",
            name: "The Twins",
            gridX: 1,
            gridY: 0,
            owner: "Frey",
            strength: 60,
            resources: 800,
            type: "castle",
            isSelected: false,
        },
        {
            id: "3",
            name: "The Eyrie",
            gridX: 2,
            gridY: 0,
            owner: "Arryn",
            strength: 70,
            resources: 900,
            type: "castle",
            isSelected: false,
        },
        {
            id: "4",
            name: "Riverrun",
            gridX: 0,
            gridY: 1,
            owner: "Tully",
            strength: 65,
            resources: 1000,
            type: "castle",
            isSelected: false,
        },
        {
            id: "5",
            name: "King's Landing",
            gridX: 1,
            gridY: 1,
            owner: "Baratheon",
            strength: 95,
            resources: 2500,
            type: "castle",
            isSelected: false,
        },
        {
            id: "6",
            name: "Dragonstone",
            gridX: 2,
            gridY: 1,
            owner: "Targaryen",
            strength: 75,
            resources: 800,
            type: "castle",
            isSelected: false,
        },
        {
            id: "7",
            name: "Casterly Rock",
            gridX: 0,
            gridY: 2,
            owner: "Lannister",
            strength: 90,
            resources: 3000,
            type: "stronghold",
            isSelected: false,
        },
        {
            id: "8",
            name: "Highgarden",
            gridX: 1,
            gridY: 2,
            owner: "Tyrell",
            strength: 70,
            resources: 1800,
            type: "castle",
            isSelected: false,
        },
        {
            id: "9",
            name: "Sunspear",
            gridX: 2,
            gridY: 2,
            owner: "Martell",
            strength: 65,
            resources: 1100,
            type: "city",
            isSelected: false,
        },
    ]

    const armies: Army[] = [
        { id: "a1", gridX: 1, gridY: 0, size: 500, owner: "P1", isMoving: false },
        { id: "a2", gridX: 1, gridY: 1, size: 800, owner: "P2", isMoving: false },
    ]

    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
    const [selectedArmy, setSelectedArmy] = useState<Army | null>(null)
    const [activePanel, setActivePanel] = useState<"territory" | "army" | "overview" | null>("overview")
    const [isMobile, setIsMobile] = useState(false)
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
    const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false)
    const mapRef = useRef<HTMLDivElement>(null)

    const [showMovementPaths, setShowMovementPaths] = useState(false)
    const [validMovementCells, setValidMovementCells] = useState<{ x: number; y: number }[]>([])
    const [movementMode, setMovementMode] = useState(false)

    const [animatingArmies, setAnimatingArmies] = useState<Set<string>>(new Set())
    const [armyPositions, setArmyPositions] = useState<{
        [key: string]: { gridX: number; gridY: number; isAnimating: boolean }
    }>(
        armies.reduce(
            (acc, army) => ({
                ...acc,
                [army.id]: { gridX: army.gridX, gridY: army.gridY, isAnimating: false },
            }),
            {},
        ),
    )

    const [activeBattle, setActiveBattle] = useState<BattleState | null>(null)
    const [battleEffects, setBattleEffects] = useState<BattleEffect[]>([])

    const [activeSiege, setActiveSiege] = useState<SiegeState | null>(null)
    const [siegeEffects, setSiegeEffects] = useState<SiegeEffect[]>([])

    const [showBattlePreview, setShowBattlePreview] = useState(false)
    const [battleTarget, setBattleTarget] = useState<{ army?: Army; territory?: Territory } | null>(null)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const handleTerritoryClick = (territory: Territory) => {
        setSelectedTerritory(territory)
        setSelectedArmy(null)
        setActivePanel("territory")
        if (isMobile) {
            setMobileBottomPanelOpen(true)
        }
    }

    const getValidMovementCells = (army: Army) => {
        const validCells: { x: number; y: number }[] = []
        const directions = [
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }, // Right
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 }, // Down
        ]

        directions.forEach((dir) => {
            const newX = army.gridX + dir.x
            const newY = army.gridY + dir.y

            // Check if the new position is within the 3x3 grid
            if (newX >= 0 && newX < 3 && newY >= 0 && newY < 3) {
                validCells.push({ x: newX, y: newY })
            }
        })

        return validCells
    }

    const getArmyDisplayPosition = (army: Army) => {
        const animatedPosition = armyPositions[army.id]
        if (animatedPosition && animatedPosition.isAnimating) {
            return { gridX: animatedPosition.gridX, gridY: animatedPosition.gridY }
        }
        return { gridX: army.gridX, gridY: army.gridY }
    }

    const handleArmyClick = (army: Army) => {
        setSelectedArmy(army)
        setSelectedTerritory(null)
        setActivePanel("army")

        // Show movement paths for selected army
        const validCells = getValidMovementCells(army)
        setValidMovementCells(validCells)
        setShowMovementPaths(true)
        setMovementMode(true)

        if (isMobile) {
            setMobileBottomPanelOpen(true)
        }
    }

    const handleMoveToCell = async (targetX: number, targetY: number) => {
        if (selectedArmy && movementMode) {
            // Start animation
            setAnimatingArmies((prev) => new Set([...prev, selectedArmy.id]))

            // Update army position with animation flag
            setArmyPositions((prev) => ({
                ...prev,
                [selectedArmy.id]: { gridX: targetX, gridY: targetY, isAnimating: true },
            }))

            // Wait for animation to complete
            setTimeout(() => {
                // Update the actual army data
                const updatedArmies = armies.map((army) =>
                    army.id === selectedArmy.id ? { ...army, gridX: targetX, gridY: targetY, isMoving: false } : army,
                )

                // Clear animation state
                setAnimatingArmies((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(selectedArmy.id)
                    return newSet
                })

                setArmyPositions((prev) => ({
                    ...prev,
                    [selectedArmy.id]: { gridX: targetX, gridY: targetY, isAnimating: false },
                }))

                // Clear movement mode
                setMovementMode(false)
                setShowMovementPaths(false)
                setValidMovementCells([])

                console.log(`Army ${selectedArmy.id} moved to (${targetX}, ${targetY})`)
            }, 800) // Animation duration
        }
    }

    const cancelMovement = () => {
        setMovementMode(false)
        setShowMovementPaths(false)
        setValidMovementCells([])
    }

    const getTerritoryColor = (owner: string) => {
        const colors = {
            Stark: "#4A90E2",
            Baratheon: "#F5A623",
            Lannister: "#D0021B",
            Targaryen: "#7ED321",
            Tyrell: "#50E3C2",
            Frey: "#9013FE",
            Arryn: "#00BCD4",
            Tully: "#FF5722",
            Martell: "#FF9800",
        }
        return colors[owner as keyof typeof colors] || "#9B9B9B"
    }

    const getTerritoryIcon = (type: string) => {
        switch (type) {
            case "castle":
                return <Crown className="w-3 h-3 md:w-4 md:h-4" />

            default:
                return <Flag className="w-3 h-3 md:w-4 md:h-4" />
        }
    }


    const calculateBattleOdds = (attacker: Army, defender: Army | Territory) => {
        const attackerStrength = attacker.size
        let defenderStrength = "size" in defender ? defender.size : defender.strength * 10

        // Add fortification bonus for castles and strongholds
        if ("type" in defender && (defender.type === "castle" || defender.type === "stronghold")) {
            const fortificationBonus = defender.type === "castle" ? 2.5 : 2.0
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
            : { gridX: battle.defenderTerritory!.gridX, gridY: battle.defenderTerritory!.gridY }

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
            x: battle.defenderArmy ? battle.defenderArmy.gridX : battle.defenderTerritory!.gridX,
            y: battle.defenderArmy ? battle.defenderArmy.gridY : battle.defenderTerritory!.gridY,
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
        const isFortified = "type" in target && (target.type === "castle" || target.type === "stronghold")

        if (isFortified) {
            startSiege(attacker, target as Territory)
        } else {
            const battle: BattleState = {
                id: battleId,
                attackerArmy: attacker,
                defenderArmy: "size" in target ? target : undefined,
                defenderTerritory: "strength" in target ? target : undefined,
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
    }

    const startSiege = (attacker: Army, fortress: Territory) => {
        const siegeId = `siege_${Date.now()}`

        const siege: SiegeState = {
            id: siegeId,
            attackerArmy: attacker,
            defenderTerritory: fortress,
            isActive: true,
            progress: 0,
            attackerDamage: 0,
            defenderDamage: 0,
            winner: null,
            phase: "combat",
            siegePhase: "approach",
            wallIntegrity: 100,
            siegeEquipment: ["catapult", "battering_ram"],
            defenseBonus: fortress.type === "castle" ? 2.5 : 2.0,
            siegeDuration: fortress.type === "castle" ? 8000 : 6000, // 8s for castles, 6s for strongholds
        }

        setActiveSiege(siege)
        setActiveBattle(null)
        setShowBattlePreview(false)
        setBattleTarget(null)

        animateSiege(siege)
    }

    const animateSiege = (siege: SiegeState) => {
        const startTime = Date.now()
        const phaseDuration = siege.siegeDuration / 6 // 6 phases

        const siegeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / siege.siegeDuration, 1)
            const currentPhaseIndex = Math.floor(progress * 6)

            const phases: SiegeState["siegePhase"][] = ["approach", "setup", "bombardment", "assault", "breach", "capture"]
            const currentPhase = phases[currentPhaseIndex] || "capture"

            // Add siege effects based on phase
            if (currentPhase === "bombardment" && Math.random() < 0.4) {
                addSiegeEffect(siege, "catapult")
            } else if (currentPhase === "assault" && Math.random() < 0.3) {
                addSiegeEffect(siege, "battering_ram")
            } else if (currentPhase === "breach" && Math.random() < 0.5) {
                addSiegeEffect(siege, "wall_damage")
            }

            // Calculate wall damage
            const wallIntegrity = Math.max(0, 100 - progress * 100)

            // Calculate casualties
            const { attackerOdds } = calculateBattleOdds(siege.attackerArmy, siege.defenderTerritory!)
            const attackerDamage = Math.floor(progress * (1 - attackerOdds) * 150) // Higher casualties in sieges
            const defenderDamage = Math.floor(progress * attackerOdds * 100)

            setActiveSiege((prev) =>
                prev
                    ? {
                        ...prev,
                        progress,
                        siegePhase: currentPhase,
                        wallIntegrity,
                        attackerDamage,
                        defenderDamage,
                    }
                    : null,
            )

            if (progress >= 1) {
                clearInterval(siegeInterval)
                completeSiege(siege, attackerOdds)
            }
        }, 150)
    }

    const addSiegeEffect = (siege: SiegeState, effectType: "catapult" | "battering_ram" | "wall_damage") => {
        const attackerPos = getArmyDisplayPosition(siege.attackerArmy)
        const defenderPos = { gridX: siege.defenderTerritory!.gridX, gridY: siege.defenderTerritory!.gridY }

        let effect: SiegeEffect

        if (effectType === "catapult") {
            effect = {
                id: `siege_effect_${Date.now()}_${Math.random()}`,
                type: "catapult",
                x: defenderPos.gridX,
                y: defenderPos.gridY,
                startX: attackerPos.gridX,
                startY: attackerPos.gridY,
                endX: defenderPos.gridX,
                endY: defenderPos.gridY,
                projectile: true,
                timestamp: Date.now(),
            }
        } else if (effectType === "battering_ram") {
            effect = {
                id: `siege_effect_${Date.now()}_${Math.random()}`,
                type: "battering_ram",
                x: defenderPos.gridX,
                y: defenderPos.gridY,
                timestamp: Date.now(),
            }
        } else {
            effect = {
                id: `siege_effect_${Date.now()}_${Math.random()}`,
                type: "wall_damage",
                x: defenderPos.gridX,
                y: defenderPos.gridY,
                timestamp: Date.now(),
            }
        }

        setSiegeEffects((prev) => [...prev, effect])

        // Remove effect after animation
        setTimeout(
            () => {
                setSiegeEffects((prev) => prev.filter((e) => e.id !== effect.id))
            },
            effectType === "catapult" ? 2000 : 1500,
        )
    }

    const completeSiege = (siege: SiegeState, attackerOdds: number) => {
        // Sieges are harder to win, reduce attacker odds
        const adjustedOdds = attackerOdds * 0.7
        const winner = Math.random() < adjustedOdds ? "attacker" : "defender"

        // Add final effect
        const finalEffect: SiegeEffect = {
            id: `siege_final_${Date.now()}`,
            type: winner === "attacker" ? "breach" : "victory",
            x: siege.defenderTerritory!.gridX,
            y: siege.defenderTerritory!.gridY,
            timestamp: Date.now(),
        }

        setSiegeEffects((prev) => [...prev, finalEffect])

        setActiveSiege((prev) =>
            prev
                ? {
                    ...prev,
                    winner,
                    phase: "results",
                }
                : null,
        )

        setTimeout(() => {
            applySiegeResults(siege, winner)
        }, 3000)
    }

    const applySiegeResults = (siege: SiegeState, winner: "attacker" | "defender") => {
        if (winner === "attacker") {
            console.log(`${siege.attackerArmy.owner} successfully besieged ${siege.defenderTerritory!.name}!`)
        } else {
            console.log(`${siege.defenderTerritory!.name} withstood the siege!`)
        }

        setTimeout(() => {
            setActiveSiege(null)
            setSiegeEffects([])
        }, 1000)
    }

    const initiateBattle = (target: Army | Territory) => {
        if (!selectedArmy) return

        setBattleTarget({
            army: "size" in target ? target : undefined,
            territory: "strength" in target ? target : undefined,
        })
        setShowBattlePreview(true)
    }

    const PanelContent = () => (
        <div className="space-y-4">
            {activePanel === "army" && selectedArmy && (
                <>
                    <h3 className="text-lg font-bold">Army Details</h3>
                    <Card className="bg-slate-700 border-slate-600 text-white">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Owner</span>
                                    <Badge style={{ backgroundColor: getTerritoryColor(selectedArmy.owner) }}>{selectedArmy.owner}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Size</span>
                                    <span>{selectedArmy.size} troops</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Position</span>
                                    <span>
                                        ({selectedArmy.gridX}, {selectedArmy.gridY})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status</span>
                                    <Badge
                                        variant={selectedArmy.isMoving || animatingArmies.has(selectedArmy.id) ? "default" : "secondary"}
                                    >
                                        {animatingArmies.has(selectedArmy.id)
                                            ? "Moving..."
                                            : selectedArmy.isMoving
                                                ? "Moving"
                                                : "Stationed"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {movementMode ? (
                        <div className="space-y-2">
                            <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Navigation className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 font-semibold">Movement Mode Active</span>
                                </div>
                                <p className="text-sm text-green-300">Click on a highlighted cell to move your army there.</p>
                            </div>
                            <Button variant="outline" className="w-full text-black" onClick={cancelMovement}>
                                Cancel Movement
                            </Button>
                        </div>
                    ) : activeSiege && activeSiege.attackerArmy.id === selectedArmy.id ? (
                        <div className="space-y-2">
                            <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-orange-400" />
                                    <span className="text-orange-400 font-semibold">Siege in Progress</span>
                                </div>

                                {activeSiege.phase === "combat" && (
                                    <>
                                        <div className="text-sm mb-2 capitalize text-orange-300">
                                            Phase: {activeSiege.siegePhase.replace("_", " ")}
                                        </div>

                                        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-orange-500 h-2 rounded-full transition-all duration-150"
                                                style={{ width: `${activeSiege.progress * 100}%` }}
                                            />
                                        </div>

                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span>Wall Integrity:</span>
                                                <span
                                                    className={
                                                        activeSiege.wallIntegrity > 50
                                                            ? "text-green-400"
                                                            : activeSiege.wallIntegrity > 25
                                                                ? "text-yellow-400"
                                                                : "text-red-400"
                                                    }
                                                >
                                                    {Math.round(activeSiege.wallIntegrity)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Attacker Losses:</span>
                                                <span className="text-red-400">-{activeSiege.attackerDamage}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Defender Losses:</span>
                                                <span className="text-red-400">-{activeSiege.defenderDamage}</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeSiege.phase === "results" && (
                                    <div className="text-center">
                                        <div
                                            className={`text-lg font-bold ${activeSiege.winner === "attacker" ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {activeSiege.winner === "attacker" ? "Fortress Captured!" : "Siege Failed!"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeBattle && activeBattle.attackerArmy.id === selectedArmy.id ? (
                        <div className="space-y-2">
                            <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sword className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400 font-semibold">Battle in Progress</span>
                                </div>

                                {activeBattle.phase === "combat" && (
                                    <>
                                        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full transition-all duration-100"
                                                style={{ width: `${activeBattle.progress * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Attacker: -{activeBattle.attackerDamage}</span>
                                            <span>Defender: -{activeBattle.defenderDamage}</span>
                                        </div>
                                    </>
                                )}

                                {activeBattle.phase === "results" && (
                                    <div className="text-center">
                                        <div
                                            className={`text-lg font-bold ${activeBattle.winner === "attacker" ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {activeBattle.winner === "attacker" ? "Victory!" : "Defeat!"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            <Button
                                className="w-full"
                                disabled={selectedArmy && animatingArmies.has(selectedArmy.id)}
                                onClick={() => {
                                    if (selectedArmy && !animatingArmies.has(selectedArmy.id)) {
                                        const validCells = getValidMovementCells(selectedArmy)
                                        setValidMovementCells(validCells)
                                        setShowMovementPaths(true)
                                        setMovementMode(true)
                                    }
                                }}
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                {selectedArmy && animatingArmies.has(selectedArmy.id) ? "Moving..." : "Move Army"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    // Find nearby enemies to attack
                                    const nearbyEnemies = armies.filter(
                                        (army) =>
                                            army.owner !== selectedArmy?.owner &&
                                            Math.abs(army.gridX - selectedArmy!.gridX) <= 1 &&
                                            Math.abs(army.gridY - selectedArmy!.gridY) <= 1,
                                    )

                                    const nearbyTerritories = territories.filter(
                                        (territory) =>
                                            territory.owner !== selectedArmy?.owner &&
                                            Math.abs(territory.gridX - selectedArmy!.gridX) <= 1 &&
                                            Math.abs(territory.gridY - selectedArmy!.gridY) <= 1,
                                    )

                                    if (nearbyEnemies.length > 0) {
                                        initiateBattle(nearbyEnemies[0])
                                    } else if (nearbyTerritories.length > 0) {
                                        initiateBattle(nearbyTerritories[0])
                                    }
                                }}
                            >
                                <Sword className="w-4 h-4 mr-2" />
                                Attack Nearby
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Users className="w-4 h-4 mr-2" />
                                Split Army
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )

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
                    className="w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-auto"
                    style={{
                        transform: `scale(1)`,
                        transformOrigin: "center center",
                        height: isMobile && mobileBottomPanelOpen
                            ? 'calc(100vh - 60vh)' // Subtract panel height (60vh)
                            : '100vh'
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
                                                {getTerritoryIcon(territory.type)}
                                                <span className="text-xs md:text-sm font-bold truncate">{territory.name}</span>
                                            </div>
                                            <div className="text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Sword className="w-3 h-3" />
                                                    <span>{territory.strength}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Army on Territory */}

                                        {armies
                                            .filter((army) => {
                                                const displayPos = getArmyDisplayPosition(army)
                                                return displayPos.gridX === territory.gridX && displayPos.gridY === territory.gridY
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
                                                            backgroundColor: getTerritoryColor(army.owner),
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
                            const startPos = { gridX: army.gridX, gridY: army.gridY }
                            const endPos = armyPositions[army.id]

                            return (
                                <div
                                    key={`floating-${army.id}`}
                                    className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/50 z-10"
                                    style={{
                                        backgroundColor: getTerritoryColor(army.owner),
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
                          left: ${endPos.gridX * 33.333 + 16.666}%;
                          top: ${endPos.gridY * 33.333 + 16.666}%;
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

            {/* Battle/Siege Preview Modal */}
            {showBattlePreview && battleTarget && selectedArmy && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="bg-slate-800 border-slate-700 w-96 max-w-[90vw]">
                        <CardContent className="p-6">
                            {(() => {
                                const target = battleTarget.army || battleTarget.territory!
                                const isFortified =
                                    battleTarget.territory &&
                                    (battleTarget.territory.type === "castle" || battleTarget.territory.type === "stronghold")

                                return (
                                    <>
                                        <h3 className="text-xl font-bold mb-4 text-center">
                                            {isFortified ? "Siege Preview" : "Battle Preview"}
                                        </h3>

                                        {isFortified && (
                                            <div className="mb-4 p-3 bg-orange-900/30 border border-orange-600 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Shield className="w-4 h-4 text-orange-400" />
                                                    <span className="text-orange-400 font-semibold">Fortified Position</span>
                                                </div>
                                                <div className="text-sm text-orange-300">
                                                    This {battleTarget.territory!.type} has strong defenses. Siege will take longer and cause more
                                                    casualties.
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-blue-400">Attacker</div>
                                                <div className="text-sm">{selectedArmy.owner}</div>
                                                <div className="text-2xl font-bold">{selectedArmy.size}</div>
                                                <div className="text-xs text-slate-400">troops</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-red-400">Defender</div>
                                                <div className="text-sm">{battleTarget.army?.owner || battleTarget.territory?.owner}</div>
                                                <div className="text-2xl font-bold">
                                                    {battleTarget.army?.size || battleTarget.territory!.strength * 10}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {battleTarget.army ? "troops" : isFortified ? "fortified strength" : "strength"}
                                                </div>
                                            </div>
                                        </div>

                                        {(() => {
                                            const { attackerOdds, defenderOdds } = calculateBattleOdds(selectedArmy, target)
                                            const adjustedAttackerOdds = isFortified ? attackerOdds * 0.7 : attackerOdds
                                            const adjustedDefenderOdds = 1 - adjustedAttackerOdds

                                            return (
                                                <div className="mb-4">
                                                    <div className="text-sm text-center mb-2">
                                                        {isFortified ? "Siege Odds (Reduced)" : "Battle Odds"}
                                                    </div>
                                                    <div className="flex">
                                                        <div
                                                            className="bg-blue-500 h-4 flex items-center justify-center text-xs text-white"
                                                            style={{ width: `${adjustedAttackerOdds * 100}%` }}
                                                        >
                                                            {Math.round(adjustedAttackerOdds * 100)}%
                                                        </div>
                                                        <div
                                                            className="bg-red-500 h-4 flex items-center justify-center text-xs text-white"
                                                            style={{ width: `${adjustedDefenderOdds * 100}%` }}
                                                        >
                                                            {Math.round(adjustedDefenderOdds * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1"
                                                onClick={() => {
                                                    const target = battleTarget.army || battleTarget.territory!
                                                    startBattle(selectedArmy, target)
                                                }}
                                            >
                                                {isFortified ? (
                                                    <>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Begin Siege!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sword className="w-4 h-4 mr-2" />
                                                        Attack!
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setShowBattlePreview(false)
                                                    setBattleTarget(null)
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                )
                            })()}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Battle Effects Overlay */}
            {battleEffects.length > 0 && (
                <div className="absolute inset-0 p-4 pointer-events-none z-30">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                        {battleEffects.map((effect) => (
                            <div
                                key={effect.id}
                                className="absolute flex items-center justify-center"
                                style={{
                                    left: `${effect.x * 33.333 + 16.666}%`,
                                    top: `${effect.y * 33.333 + 16.666}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                {effect.type === "clash" && (
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-full animate-ping" />
                                        <Sword className="absolute inset-0 w-6 h-6 text-white animate-spin" style={{ margin: "4px" }} />
                                    </div>
                                )}

                                {effect.type === "explosion" && (
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-red-500 rounded-full animate-ping opacity-75" />
                                        <div
                                            className="absolute inset-0 w-8 h-8 bg-orange-400 rounded-full animate-pulse"
                                            style={{ margin: "8px" }}
                                        />
                                    </div>
                                )}

                                {effect.type === "damage" && <div className="text-red-400 font-bold text-lg animate-bounce">-DMG</div>}

                                {effect.type === "victory" && (
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-green-500 rounded-full animate-ping opacity-50" />
                                        <Crown
                                            className="absolute inset-0 w-8 h-8 text-yellow-400 animate-pulse"
                                            style={{ margin: "16px" }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Siege Effects Overlay */}
            {siegeEffects.length > 0 && (
                <div className="absolute inset-0 p-4 pointer-events-none z-30">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                        {siegeEffects.map((effect) => (
                            <div
                                key={effect.id}
                                className="absolute flex items-center justify-center"
                                style={{
                                    left: `${effect.x * 33.333 + 16.666}%`,
                                    top: `${effect.y * 33.333 + 16.666}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                {effect.type === "catapult" && (
                                    <div className="relative">
                                        {effect.projectile && (
                                            <div
                                                className="absolute w-3 h-3 bg-orange-500 rounded-full"
                                                style={{
                                                    animation: `catapultProjectile-${effect.id} 1.5s ease-in-out forwards`,
                                                }}
                                            />
                                        )}
                                        <div className="w-16 h-16 bg-orange-600 rounded-full animate-ping opacity-75" />
                                        <div
                                            className="absolute inset-0 w-12 h-12 bg-red-500 rounded-full animate-pulse"
                                            style={{ margin: "8px" }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-orange-200 font-bold text-xs">CATAPULT</div>
                                        </div>

                                        <style jsx>{`
                      @keyframes catapultProjectile-${effect.id} {
                        0% {
                          left: ${(effect.startX! - effect.x) * 33.333}%;
                          top: ${(effect.startY! - effect.y) * 33.333}%;
                          transform: translate(-50%, -50%);
                        }
                        50% {
                          top: ${(effect.startY! - effect.y) * 33.333 - 20}%;
                        }
                        100% {
                          left: 0%;
                          top: 0%;
                          transform: translate(-50%, -50%);
                        }
                      }
                    `}</style>
                                    </div>
                                )}

                                {effect.type === "battering_ram" && (
                                    <div className="relative">
                                        <div className="w-12 h-8 bg-amber-700 rounded animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-2 bg-amber-900 animate-bounce" />
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-amber-200 font-bold text-xs">
                                            RAM
                                        </div>
                                    </div>
                                )}

                                {effect.type === "wall_damage" && (
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-slate-600 rounded animate-pulse opacity-75" />
                                        <div className="absolute inset-2 bg-red-500 animate-ping opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-red-400 font-bold text-sm animate-bounce">CRACK!</div>
                                        </div>
                                    </div>
                                )}

                                {effect.type === "fire" && (
                                    <div className="relative">
                                        <div className="w-8 h-12 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 animate-pulse" />
                                        <div className="absolute -inset-2 bg-orange-400 rounded-full animate-ping opacity-30" />
                                    </div>
                                )}

                                {effect.type === "breach" && (
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-slate-400 rounded opacity-50" />
                                        <div className="absolute inset-4 bg-gradient-to-br from-red-600 to-orange-500 animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-green-400 font-bold text-lg animate-bounce">BREACH!</div>
                                        </div>
                                    </div>
                                )}

                                {effect.type === "victory" && (
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-green-500 rounded-full animate-ping opacity-50" />
                                        <Crown
                                            className="absolute inset-0 w-10 h-10 text-yellow-400 animate-pulse"
                                            style={{ margin: "20px" }}
                                        />
                                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-green-400 font-bold text-sm">
                                            CAPTURED!
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
