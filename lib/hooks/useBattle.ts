'use client'

import { useState, useCallback } from 'react'
import { Territory, Army } from '@/lib/types/game'
import { BattleState, BattleEffect, BattleTarget } from '@/lib/types/advancedGame'

interface BattleSystemState {
  activeBattle: BattleState | null
  battleEffects: BattleEffect[]
  showBattlePreview: boolean
  battleTarget: BattleTarget | null
}

interface BattleSystemActions {
  // Battle state management
  setActiveBattle: (battle: BattleState | null | ((prev: BattleState | null) => BattleState | null)) => void
  setBattleEffects: (effects: BattleEffect[] | ((prev: BattleEffect[]) => BattleEffect[])) => void
  setShowBattlePreview: (show: boolean) => void
  setBattleTarget: (target: BattleTarget | null) => void
  
  // Battle logic
  calculateBattleOdds: (attacker: Army, defender: Army | Territory) => { attackerOdds: number; defenderOdds: number }
  initializeBattle: (attacker: Army, target: Army | Territory) => void
  startBattle: (attacker: Army, target: Army | Territory, getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
  completeBattle: (battle: BattleState, winner: "attacker" | "defender") => void
  addBattleEffect: (battle: BattleState, type: "clash" | "explosion" | "victory", getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
  animateBattle: (battle: BattleState, getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
}

export function useBattle(): BattleSystemState & BattleSystemActions {
  const [activeBattle, setActiveBattle] = useState<BattleState | null>(null)
  const [battleEffects, setBattleEffects] = useState<BattleEffect[]>([])
  const [showBattlePreview, setShowBattlePreview] = useState(false)
  const [battleTarget, setBattleTarget] = useState<BattleTarget | null>(null)

  const calculateBattleOdds = useCallback((attacker: Army, defender: Army | Territory) => {
    const attackerStrength = attacker.size
    let defenderStrength = "size" in defender 
      ? defender.size 
      : Number(defender.units.reduce((acc, curr) => acc + Number(curr), 0)) * 10

    // Add fortification bonus for castles
    if ("isCastle" in defender && defender.isCastle) {
      const fortificationBonus = defender.isCastle ? 2.5 : 2.0
      defenderStrength *= fortificationBonus
    }

    const attackerOdds = attackerStrength / (attackerStrength + defenderStrength)
    const defenderOdds = 1 - attackerOdds

    return { attackerOdds, defenderOdds }
  }, [])

  const initializeBattle = useCallback((attacker: Army, target: Army | Territory) => {
    setBattleTarget({
      army: "size" in target ? (target as Army) : undefined,
      territory: "units" in target ? (target as Territory) : undefined,
    })
    setShowBattlePreview(true)
  }, [])

  const addBattleEffect = useCallback((
    battle: BattleState, 
    type: "clash" | "explosion" | "victory",
    getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  ) => {
    const attackerPos = getArmyDisplayPosition(battle.attackerArmy)
    const defenderPos = battle.defenderArmy
      ? getArmyDisplayPosition(battle.defenderArmy)
      : { gridX: battle.defenderTerritory!.x, gridY: battle.defenderTerritory!.y }

    const effect: BattleEffect = {
      id: `battle_effect_${Date.now()}_${Math.random()}`,
      type: type,
      x: type === "victory" 
        ? (battle.defenderArmy ? battle.defenderArmy.x : battle.defenderTerritory!.x)
        : (attackerPos.gridX + defenderPos.gridX) / 2,
      y: type === "victory" 
        ? (battle.defenderArmy ? battle.defenderArmy.y : battle.defenderTerritory!.y)
        : (attackerPos.gridY + defenderPos.gridY) / 2,
      timestamp: Date.now(),
    }

    setBattleEffects(prev => [...prev, effect])

    // Remove effect after animation
    setTimeout(() => {
      setBattleEffects(prev => prev.filter(e => e.id !== effect.id))
    }, type === "victory" ? 2000 : type === "explosion" ? 1200 : 800)
  }, [])

  const animateBattle = useCallback((
    battle: BattleState,
    getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  ) => {
    const startTime = Date.now()
    const battleDuration = 3000 // 3 seconds

    const battleInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / battleDuration, 1)

      // Calculate casualties
      const { attackerOdds } = calculateBattleOdds(
        battle.attackerArmy,
        battle.defenderArmy || battle.defenderTerritory!
      )
      const attackerDamage = Math.floor(progress * (1 - attackerOdds) * 100)
      const defenderDamage = Math.floor(progress * attackerOdds * 80)

      // Add battle effects
      if (Math.random() < 0.3) {
        addBattleEffect(battle, "clash", getArmyDisplayPosition)
      } else if (Math.random() < 0.1) {
        addBattleEffect(battle, "explosion", getArmyDisplayPosition)
      }

      setActiveBattle(prev =>
        prev ? {
          ...prev,
          progress,
          attackerDamage,
          defenderDamage,
        } : null
      )

      if (progress >= 1) {
        clearInterval(battleInterval)
        const winner = Math.random() < attackerOdds ? "attacker" : "defender"
        completeBattle(battle, winner)
      }
    }, 100)
  }, [calculateBattleOdds, addBattleEffect])

  const completeBattle = useCallback((battle: BattleState, winner: "attacker" | "defender") => {
    // Add final effect
    addBattleEffect(battle, "victory", (army) => ({ gridX: army.x, gridY: army.y }))

    setActiveBattle(prev =>
      prev ? {
        ...prev,
        winner,
        phase: "results",
      } : null
    )

    // Apply battle results and cleanup
    setTimeout(() => {
      if (winner === "attacker") {
        console.log(`${battle.attackerArmy.owner} won the battle!`)
      } else {
        console.log(`${battle.attackerArmy.owner} was defeated!`)
      }

      setTimeout(() => {
        setActiveBattle(null)
        setBattleEffects([])
      }, 1000)
    }, 2000)
  }, [addBattleEffect])

  const startBattle = useCallback((
    attacker: Army, 
    target: Army | Territory,
    getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  ) => {
    const battleId = `battle_${Date.now()}`

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
    animateBattle(battle, getArmyDisplayPosition)
  }, [animateBattle])

  return {
    // State
    activeBattle,
    battleEffects,
    showBattlePreview,
    battleTarget,
    
    // Actions
    setActiveBattle,
    setBattleEffects,
    setShowBattlePreview,
    setBattleTarget,
    calculateBattleOdds,
    initializeBattle,
    startBattle,
    completeBattle,
    addBattleEffect,
    animateBattle,
  }
}