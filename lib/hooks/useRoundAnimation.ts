import { useEffect, useRef, useCallback } from 'react'
import { StateManager } from '@/lib/systems/StateManager'
import { AnimationSequencer } from '@/lib/systems/AnimationSequencer'
import { AnimationExecutor, AnimationCallbacks } from '@/lib/systems/AnimationExecutor'
import { RoundHistoryManager, MissedRoundsInfo } from '@/lib/systems/RoundHistoryManager'
import { useGameStateContext, useMovementContext, useBattleContext } from '@/lib/contexts/GameContext'
import { logger } from '@/lib/utils/logger'
import { setAdd, setDelete } from '@/lib/utils/setHelpers'
import { Army } from '@/lib/types/game'
import { BattleState } from '@/lib/types/advancedGame'

/**
 * useRoundAnimation Hook
 *
 * Integrates all animation systems with the game context
 * Handles round transitions with smooth animations
 */

interface UseRoundAnimationOptions {
  gameAddress: `0x${string}` | undefined
  onMissedRounds?: (info: MissedRoundsInfo) => void
  autoPlayMissedRounds?: boolean
}

interface UseRoundAnimationReturn {
  isAnimating: boolean
  playRoundTransition: (newRoundNumber: number) => Promise<void>
  checkForMissedRounds: () => MissedRoundsInfo | null
  playMissedRounds: (rounds: number[]) => Promise<void>
}

export function useRoundAnimation({
  gameAddress,
  onMissedRounds,
  autoPlayMissedRounds = false,
}: UseRoundAnimationOptions): UseRoundAnimationReturn {
  // Context hooks
  const { territories, armies, refreshAllData } = useGameStateContext()
  const {
    setAnimatingArmies,
    setArmyPositions,
    cancelMovement,
    getArmyDisplayPosition,
  } = useMovementContext()
  const {
    startBattle,
    addBattleEffect,
  } = useBattleContext()

  // Initialize systems (singleton instances)
  const stateManager = useRef(new StateManager()).current
  const sequencer = useRef(new AnimationSequencer()).current
  const executor = useRef(new AnimationExecutor()).current
  const historyManager = useRef(new RoundHistoryManager()).current

  // Track current round
  const currentRoundRef = useRef<number>(0)

  /**
   * Setup animation callbacks
   */
  useEffect(() => {
    const callbacks: AnimationCallbacks = {
      // Movement animations
      onMoveStart: (armyId, from, to) => {
        logger.debug(`Move start: ${armyId} from (${from.x},${from.y}) to (${to.x},${to.y})`)

        // Set army as animating (using optimized helper)
        setAnimatingArmies((prev) => setAdd(prev, armyId))

        // Set target position
        setArmyPositions((prev) => ({
          ...prev,
          [armyId]: { x: to.x, y: to.y, isAnimating: true },
        }))
      },

      onMoveComplete: (armyId) => {
        logger.debug(`Move complete: ${armyId}`)

        // Clear animating state (using optimized helper)
        setAnimatingArmies((prev) => setDelete(prev, armyId))

        // Clear position override
        setArmyPositions((prev) => {
          const newPositions = { ...prev }
          delete newPositions[armyId]
          return newPositions
        })
      },

      // Battle animations
      onBattleStart: (location, intensity) => {
        logger.debug(`Battle start at (${location.x},${location.y}) - intensity: ${intensity}`)

        // Find armies at this location for battle animation
        const armiesAtLocation = armies.filter(
          (army) => army.x === location.x && army.y === location.y
        )

        if (armiesAtLocation.length >= 2) {
          // Trigger battle animation using existing system
          // Note: This is a visualization only, actual battle resolution already happened on-chain
          const attacker = armiesAtLocation[0]
          const defender = armiesAtLocation[1]

          // Guard against undefined (TypeScript safety)
          if (!attacker || !defender) return

          // Add battle effects
          const fakeAttacker: Army = { ...attacker, x: location.x, y: location.y }
          const fakeBattle: BattleState = {
            id: `battle_${Date.now()}`,
            attackerArmy: fakeAttacker,
            defenderArmy: defender,
            defenderTerritory: undefined,
            isActive: true,
            progress: 0,
            attackerDamage: 0,
            defenderDamage: 0,
            winner: null,
            phase: 'combat' as const,
          }

          // Add visual effects
          addBattleEffect(fakeBattle, 'clash', getArmyDisplayPosition)

          // Add more effects during battle
          setTimeout(() => {
            if (intensity === 'high') {
              addBattleEffect(fakeBattle, 'explosion', getArmyDisplayPosition)
            }
          }, 1500)
        }
      },

      onBattleComplete: (location) => {
        logger.debug(`Battle complete at (${location.x},${location.y})`)
        // Battle effects auto-cleanup via timeouts
      },

      // Territory capture animations
      onCaptureStart: (territory, newOwner) => {
        logger.debug(`Capture start: (${territory.x},${territory.y}) by ${newOwner.slice(0, 6)}...`)
        // Territory color will update via state refresh
        // Could add particle effects here
      },

      onCaptureComplete: (territory) => {
        logger.debug(`Capture complete: (${territory.x},${territory.y})`)
      },

      // Army spawn/destroy
      onArmySpawn: (army) => {
        logger.debug(`Army spawned: ${army.id} at (${army.x},${army.y})`)
        // Add spawn animation effect
      },

      onArmyDestroy: (army) => {
        logger.debug(`Army destroyed: ${army.id}`)
        // Add destruction animation effect
      },
    }

    executor.setCallbacks(callbacks)
  }, [armies, setAnimatingArmies, setArmyPositions, addBattleEffect, getArmyDisplayPosition, executor])

  /**
   * Play round transition animation
   */
  const playRoundTransition = useCallback(
    async (newRoundNumber: number) => {
      if (!gameAddress) return

      logger.log(`Playing round transition: ${currentRoundRef.current} → ${newRoundNumber}`)

      try {
        // 1. Capture current state before fetching new data
        stateManager.captureSnapshot(territories, armies, currentRoundRef.current)

        // 2. Fetch new game data
        await refreshAllData()

        // 3. Update current round
        const oldRound = currentRoundRef.current
        currentRoundRef.current = newRoundNumber

        // 4. Calculate diff
        const diff = stateManager.calculateDiff()

        if (diff) {
          // 5. Generate animation sequence
          const sequence = sequencer.generateSequence(diff)

          // 6. Play animations
          await executor.playSequence(sequence)
        } else {
          logger.debug('No diff calculated, skipping animations')
        }

        // 7. Mark round as viewed
        historyManager.markRoundAsViewed(gameAddress, newRoundNumber)

        // 8. Clear any movement state
        cancelMovement()

        logger.log(`Round transition complete: round ${newRoundNumber}`)
      } catch (error) {
        logger.error('Error during round transition:', error)
      }
    },
    [gameAddress, territories, armies, refreshAllData, cancelMovement, stateManager, sequencer, executor, historyManager]
  )

  /**
   * Check for missed rounds
   */
  const checkForMissedRounds = useCallback((): MissedRoundsInfo | null => {
    if (!gameAddress || currentRoundRef.current === 0) return null

    const info = historyManager.checkMissedRounds(gameAddress, currentRoundRef.current)

    if (info.hasMissedRounds && onMissedRounds) {
      onMissedRounds(info)
    }

    return info
  }, [gameAddress, historyManager, onMissedRounds])

  /**
   * Play missed rounds in fast-forward
   */
  const playMissedRounds = useCallback(
    async (rounds: number[]) => {
      logger.log(`Playing ${rounds.length} missed rounds...`)

      for (const round of rounds) {
        // Play each missed round
        // Note: We don't have historical state, so this is a placeholder
        // In a full implementation, you'd fetch getRoundMoves(round) and reconstruct state
        logger.debug(`Fast-forwarding round ${round}`)

        // Mark as viewed
        if (gameAddress) {
          historyManager.markRoundAsViewed(gameAddress, round)
        }
      }

      logger.log(`Finished playing missed rounds`)
    },
    [gameAddress, historyManager]
  )

  /**
   * Check for missed rounds on mount and round changes
   */
  useEffect(() => {
    if (!gameAddress) return

    const info = checkForMissedRounds()

    if (info && info.hasMissedRounds && autoPlayMissedRounds) {
      playMissedRounds(info.missedRounds)
    }
    // Note: currentRoundRef.current is excluded as refs don't trigger re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameAddress, autoPlayMissedRounds, checkForMissedRounds, playMissedRounds])

  return {
    isAnimating: executor.isAnimating(),
    playRoundTransition,
    checkForMissedRounds,
    playMissedRounds,
  }
}
