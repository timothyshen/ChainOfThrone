"use client"

import { useRef, useMemo } from "react"
import {
  useGameStateContext,
  useSelectionContext,
  useMovementContext,
  useBattleContext,
} from "@/lib/contexts/GameContext"
import { useGameActions } from "@/lib/hooks/gameActions"
import { GRID_CONFIG } from "@/lib/constants/grid"

// Layer components
import { TerritoryGrid } from "./layers/TerritoryGrid"
import { MovementOverlay } from "./layers/MovementOverlay"
import { AnimationLayer } from "./layers/AnimationLayer"

// Hooks
import { useMapInteractions } from "@/lib/hooks/useMapInteractions"
import { useArmyLayer } from "@/lib/hooks/useArmyLayer"

interface GameMapProps {
  gameAddress: `0x${string}` | undefined
  isMobile: boolean
  setMobileBottomPanelOpen: (open: boolean) => void
}

/**
 * GameMap Component
 *
 * Main game map container with layered rendering architecture
 * Coordinates between multiple rendering layers and interaction handlers
 */
export default function GameMap({
  gameAddress,
  isMobile,
  setMobileBottomPanelOpen,
}: GameMapProps) {
  // Context hooks
  const { territories, armies } = useGameStateContext()
  const { selectedTerritory, selectedArmy, clearSelection } =
    useSelectionContext()
  const {
    movementMode,
    showMovementPaths,
    validMovementCells,
    animatingArmies,
    armyPositions,
    getArmyDisplayPosition,
    cancelMovement,
  } = useMovementContext()
  const { battleEffects } = useBattleContext()

  // Actions
  const {
    handleArmyClick,
    handleTerritoryClick,
    handleMoveToCell,
    handleInitializeBattle,
  } = useGameActions(gameAddress, isMobile, setMobileBottomPanelOpen)

  const mapRef = useRef<HTMLDivElement>(null)

  // Convert 2D territories to flat array with selection state
  const flatTerritories = useMemo(
    () =>
      territories.flat().map((territory) => ({
        ...territory,
        isSelected: selectedTerritory?.id === territory.id,
      })),
    [territories, selectedTerritory?.id]
  )

  // Map interaction handlers
  const { handleMapClick, handleCellClick, handleTerritoryCellClick } =
    useMapInteractions({
      movementMode,
      validMovementCells,
      selectedArmy,
      armies,
      flatTerritories,
      handleTerritoryClick,
      handleMoveToCell,
      handleInitializeBattle,
      clearSelection,
      cancelMovement,
    })

  // Army layer renderer
  const { renderArmiesAt } = useArmyLayer({
    armies,
    selectedArmy,
    animatingArmies,
    getArmyDisplayPosition,
    onArmyClick: handleArmyClick,
  })

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
            maxWidth: "100%",
            minHeight: "400px",
            margin: "0 auto",
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: GRID_CONFIG.totalCells }).map((_, index) => (
              <div
                key={index}
                className="border border-slate-600/30 rounded-lg bg-slate-800/20"
              />
            ))}
          </div>

          {/* Territory Grid Layer */}
          <TerritoryGrid
            flatTerritories={flatTerritories}
            isMobile={isMobile}
            onTerritoryClick={handleTerritoryCellClick}
          >
            {(territory) => renderArmiesAt(territory.x, territory.y)}
          </TerritoryGrid>

          {/* Animation Layer */}
          <AnimationLayer
            armies={armies}
            animatingArmies={animatingArmies}
            armyPositions={armyPositions}
          />

          {/* Movement Overlay Layer */}
          <MovementOverlay
            showMovementPaths={showMovementPaths}
            movementMode={movementMode}
            flatTerritories={flatTerritories}
            validMovementCells={validMovementCells}
            selectedArmy={selectedArmy}
            armies={armies}
            onCellClick={handleCellClick}
          />
        </div>
      </div>
    </div>
  )
}
