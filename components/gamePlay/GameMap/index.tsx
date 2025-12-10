"use client"

import { useRef, useMemo, useEffect } from "react"
import { useAccount } from "wagmi"
import {
  useGameStateContext,
  useSelectionContext,
  useMovementContext,
} from "@/lib/contexts/GameContext"
import { useGameActions } from "@/lib/hooks/gameActions"
import { GRID_CONFIG } from "@/lib/constants/grid"

// Layer components
import { TerritoryGrid } from "./layers/TerritoryGrid"
import { MovementOverlay } from "./layers/MovementOverlay"
import { AnimationLayer } from "./layers/AnimationLayer"
import { MiniMapPanel } from "./panels/MiniMapPanel"

// Hooks
import { useMapInteractions } from "@/lib/hooks/useMapInteractions"

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
  // Wallet connection
  const { address } = useAccount()

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
    cancelMovement,
  } = useMovementContext()

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

  // Army layer renderer - DISABLED: Army info now shown in territory grid
  // const { renderArmiesAt } = useArmyLayer({
  //   armies,
  //   selectedArmy,
  //   animatingArmies,
  //   getArmyDisplayPosition,
  //   onArmyClick: handleArmyClick,
  // })

  // ESC key to cancel operation
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (movementMode || selectedArmy || selectedTerritory)) {
        clearSelection()
        cancelMovement()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [movementMode, selectedArmy, selectedTerritory, clearSelection, cancelMovement])

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      onClick={handleMapClick}
    >
      {/* Map Canvas - Square aspect ratio, fits container */}
      <div
        ref={mapRef}
        className="relative bg-gradient-to-br from-surface-1 to-surface-2 aspect-square w-full h-full max-w-[600px] max-h-[600px] rounded-lg overflow-hidden"
      >
          {/* Grid Background - Click to cancel */}
          <div
            className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1"
            onClick={(e) => {
              // Only cancel if clicking the grid background itself
              if (e.target === e.currentTarget) {
                clearSelection()
                cancelMovement()
              }
            }}
          >
            {Array.from({ length: GRID_CONFIG.totalCells }).map((_, index) => (
              <div
                key={index}
                className="border border-border/50 rounded-lg bg-surface-2/30"
                onClick={(e) => {
                  // Click on grid cell = cancel operation
                  e.stopPropagation()
                  clearSelection()
                  cancelMovement()
                }}
              />
            ))}
          </div>

          {/* Territory Grid Layer */}
          <TerritoryGrid
            flatTerritories={flatTerritories}
            isMobile={isMobile}
            armies={armies}
            currentPlayerAddress={address}
            onTerritoryClick={handleTerritoryCellClick}
            onArmyClick={handleArmyClick}
          />

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

          {/* Cancel Button - Show when in movement mode */}
          {movementMode && selectedArmy && (
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearSelection()
                  cancelMovement()
                }}
                className="px-4 py-2 bg-game-enemy hover:bg-game-enemy/90 text-white rounded-lg shadow-soft transition-all duration-200 flex items-center gap-2 font-bold"
              >
                <span className="text-lg">✕</span>
                Cancel (ESC)
              </button>
            </div>
          )}

          {/* Mini Map Panel - Corner overlay (desktop only) */}
          {!isMobile && (
            <div className="absolute top-4 left-4 z-20 w-48">
              <MiniMapPanel isCollapsible={true} defaultExpanded={false} />
            </div>
          )}
      </div>
    </div>
  )
}
