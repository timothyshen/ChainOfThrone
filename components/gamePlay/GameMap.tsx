"use client"

import { useRef } from "react"
import { Sword, Swords, Crown, Users, Navigation, Flag } from "lucide-react"
import {
  useGameStateContext,
  useSelectionContext,
  useMovementContext,
  useBattleContext
} from "@/lib/contexts/GameContext"
import { useGameActions } from "@/lib/hooks/useGameActions"

interface GameMapProps {
  gameAddress: `0x${string}` | undefined
  isMobile: boolean
  setMobileBottomPanelOpen: (open: boolean) => void
}

export default function GameMap({
  gameAddress,
  isMobile,
  setMobileBottomPanelOpen,
}: GameMapProps) {
  // Context hooks
  const { territories, armies } = useGameStateContext()
  const { selectedTerritory, selectedArmy, clearSelection } = useSelectionContext()
  const {
    movementMode,
    showMovementPaths,
    validMovementCells,
    animatingArmies,
    armyPositions,
    getArmyDisplayPosition,
    cancelMovement
  } = useMovementContext()
  const { battleEffects } = useBattleContext()

  // Actions
  const {
    handleArmyClick,
    handleMoveToCell,
    handleInitializeBattle
  } = useGameActions(gameAddress, isMobile, setMobileBottomPanelOpen)

  const mapRef = useRef<HTMLDivElement>(null)

  // Convert 2D territories to flat array with selection state  
  const flatTerritories = territories.flat().map(territory => ({
    ...territory,
    isSelected: selectedTerritory?.id === territory.id
  }))


  const getTerritoryIcon = (isCastle: boolean) => {
    return isCastle ? <Crown className="w-3 h-3 md:w-4 md:h-4" /> : <Flag className="w-3 h-3 md:w-4 md:h-4" />
  }

  const handleMapClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection()
      cancelMovement() // Also clear movement state to remove visual indicators
      flatTerritories.forEach(territory => {
        territory.isSelected = false
      })
    }
  }

  const handleCellClick = (gridX: number, gridY: number) => {
    if (movementMode && validMovementCells.some(cell => cell.x === gridX && cell.y === gridY)) {
      const territory = flatTerritories.find(t => t.x === gridX && t.y === gridY)
      if (territory) {
        // Check if this is a battle destination
        const hasEnemyArmy = armies.some(army =>
          army.x === gridX &&
          army.y === gridY &&
          army.owner !== selectedArmy?.owner
        )

        if (hasEnemyArmy && selectedArmy) {
          const enemyArmy = armies.find(army =>
            army.x === gridX &&
            army.y === gridY &&
            army.owner !== selectedArmy.owner
          )

          if (enemyArmy) {
            console.log(`Initiating battle: ${selectedArmy.owner} vs ${enemyArmy.owner}`)
            handleInitializeBattle(selectedArmy, enemyArmy)
          }
        } else {
          // Regular move
          handleMoveToCell(territory)
        }
      }
    }
  }

  return (
    <div
      className="h-full bg-slate-900 text-white flex flex-col md:flex-row"
      onClick={handleMapClick}
    >
      {/* Main Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Canvas */}
        <div
          ref={mapRef}
          className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900"
          style={{
            transform: `scale(1)`,
            transformOrigin: "center center",
            maxWidth: '100%',
            minHeight: '400px', // Ensure minimum usable size
            margin: '0 auto'
          }}
        >
          {/* 3x3 Grid Background */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="border border-slate-600/30 rounded-lg bg-slate-800/20" />
            ))}
          </div>

          {/* Territories in Grid */}
          <div className="absolute inset-0 p-2 rounded-lg">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
              {flatTerritories.map((territory) => (
                <div
                  key={territory.id}
                  className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-slate-700/50 
                    ${territory.isSelected
                      ? "border-red-400 shadow-lg shadow-red-400/50"
                      : "border-slate-600"
                    }`}
                  style={{
                    minHeight: isMobile ? "80px" : "120px",
                  }}
                >
                  <div className="p-2 md:p-3 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-1">
                      {getTerritoryIcon(territory.isCastle)}
                      <span className="text-xs md:text-sm font-bold truncate">{territory.name}</span>
                    </div>
                    <div className="text-xs flex flex-row justify-between gap-1">
                      {
                        territory.units.map((unit, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Sword className="w-3 h-3" />
                            <span>{Number(unit)}</span>
                          </div>
                        ))
                      }
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

                      return (
                        <div
                          key={army.id}
                          className={`absolute top-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-800 ease-in-out 
                            ${selectedArmy?.id === army.id
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
                              handleArmyClick(territory, army)
                            }
                          }}
                        >
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs bg-slate-800 px-1 rounded whitespace-nowrap">
                            {army.size.toString()}
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
              ))}
            </div>
          </div>

          {/* Floating Animated Armies */}
          {armies
            .filter((army) => animatingArmies.has(army.id))
            .map((army) => {
              const startPos = { x: army.x, y: army.y }
              const endPos = armyPositions[army.id]

              if (!endPos) return null

              return (
                <div
                  key={`floating-${army.id}`}
                  className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/50 z-10"
                  style={{
                    backgroundColor: "#9B9B9B",
                    left: `${startPos.x * 33.333 + 16.666}%`,
                    top: `${startPos.y * 33.333 + 16.666}%`,
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
                const startPos = { x: army.x, y: army.y }
                const endPos = armyPositions[army.id]

                if (!endPos) return ''

                return `
                  @keyframes moveArmy-${army.id} {
                    0% {
                      left: ${startPos.x * 33.333 + 16.666}%;
                      top: ${startPos.y * 33.333 + 16.666}%;
                      transform: translate(-50%, -50%) scale(1);
                      opacity: 1;
                    }
                    50% {
                      transform: translate(-50%, -50%) scale(1.2);
                      opacity: 0.9;
                    }
                    100% {
                      left: ${endPos.x * 33.333 + 16.666}%;
                      top: ${endPos.y * 33.333 + 16.666}%;
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
            <div className="absolute inset-0 p-2 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                {flatTerritories.map((territory, index) => {
                  const gridX = territory.x
                  const gridY = territory.y
                  const isValidMove = validMovementCells.some((cell) => cell.x === gridX && cell.y === gridY)
                  const isCurrentPosition = selectedArmy && selectedArmy.x === gridX && selectedArmy.y === gridY



                  // Check for enemy armies that can be battled
                  const hasEnemyArmy = isValidMove && armies.some((army) =>
                    army.x === gridX &&
                    army.y === gridY &&
                    army.owner !== selectedArmy?.owner
                  )

                  // Priority system - only show one indicator per cell (highest priority first)
                  let cellStyle = ""
                  let cellIcon = null
                  let isClickable = false

                  if (isCurrentPosition) {
                    // Highest Priority: Current army position
                    cellStyle = "bg-blue-500/30 border-2 border-blue-400 rounded-lg"
                    cellIcon = (
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-400 animate-ping" />
                        <span className="text-xs text-blue-400 font-bold mt-1">CURRENT</span>
                      </div>
                    )
                  } else if (hasEnemyArmy) {
                    // Second Priority: Battle destinations
                    cellStyle = "bg-purple-500/30 border-2 border-purple-400 rounded-lg hover:bg-purple-500/50"
                    cellIcon = (
                      <div className="flex flex-col items-center">
                        <Swords className="w-6 h-6 md:w-8 md:h-8 text-purple-400 animate-pulse" />
                        <span className="text-xs text-purple-400 font-bold mt-1">BATTLE</span>
                      </div>
                    )
                    isClickable = true
                  } else if (isValidMove) {
                    // Third Priority: Valid movement cells
                    cellStyle = "bg-green-500/30 border-2 border-green-400 rounded-lg hover:bg-green-500/50"
                    cellIcon = (
                      <div className="flex flex-col items-center">
                        <Navigation className="w-6 h-6 md:w-8 md:h-8 text-green-400 animate-pulse" />
                        <span className="text-xs text-green-400 font-bold mt-1">MOVE</span>
                      </div>
                    )
                    isClickable = true
                  }

                  // Only render overlay if there's something to show
                  if (!cellStyle) return null

                  return (
                    <div
                      key={territory.id}
                      className={`relative flex items-center p-4 justify-center transition-all duration-200 
                        ${cellStyle} ${isClickable ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
                      style={{
                        gridColumn: gridX + 1,  // CSS grid is 1-indexed
                        gridRow: gridY + 1      // CSS grid is 1-indexed
                      }}
                      onClick={isClickable ? () => handleCellClick(gridX, gridY) : undefined}
                    >
                      {cellIcon}
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