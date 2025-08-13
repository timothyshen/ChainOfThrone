'use client'

import { useState, useCallback } from 'react'
import { Territory, Army } from '@/lib/types/game'

interface SelectionState {
  selectedTerritory: Territory | null
  selectedArmy: Army | null
}

interface SelectionActions {
  setSelectedTerritory: (territory: Territory | null) => void
  setSelectedArmy: (army: Army | null) => void
  clearSelection: () => void
  selectTerritory: (territory: Territory) => void
  selectArmy: (army: Army) => void
}

export function useSelection(): SelectionState & SelectionActions {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
  const [selectedArmy, setSelectedArmy] = useState<Army | null>(null)

  const clearSelection = useCallback(() => {
    setSelectedTerritory(null)
    setSelectedArmy(null)
  }, [])

  const selectTerritory = useCallback((territory: Territory) => {
    setSelectedTerritory(territory)
    setSelectedArmy(null) // Clear army selection when selecting territory
  }, [])

  const selectArmy = useCallback((army: Army) => {
    setSelectedArmy(army)
    // Don't clear territory selection as army might be on a territory
  }, [])

  return {
    // State
    selectedTerritory,
    selectedArmy,
    
    // Actions
    setSelectedTerritory,
    setSelectedArmy,
    clearSelection,
    selectTerritory,
    selectArmy,
  }
}