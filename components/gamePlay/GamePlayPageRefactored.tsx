'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useAccount, useWatchContractEvent } from 'wagmi'
import { useGameAddress } from '@/lib/hooks/useGameAddress'
import { gameAbi } from '@/lib/contract/gameAbi'
import { useToast } from "@/lib/hooks/use-toast"
import { Spinner } from '../ui/spinner'
import GameStatus from '@/components/gamePlay/GameStatus/GameStatus'
import { GameOverview } from './GameStatus/GameOverview'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ChevronDown } from 'lucide-react'
import GameOperationPanelNew from '@/components/gamePlay/GameMap/GameOperationPanelNew'
import ImprovedGameMapNew from '@/components/gamePlay/ImprovedGameMapNew'
import BattleEffectOverlay from '@/components/gamePlay/GameMap/BattleEffectOverlay'
import { GameContextProvider, useGameStateContext, useBattleContext } from '@/lib/contexts/GameContext'

interface GamePlayPageRefactoredProps {
  gameAddressParam: `0x${string}`
}

// Inner component that has access to context
function GamePlayContent({ gameAddressParam }: GamePlayPageRefactoredProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  
  // Context hooks
  const { 
    gameStatus, 
    totalPlayer, 
    maxPlayer, 
    playerAddresses,
    isGridLoading,
    isStatusLoading,
    refreshAllData 
  } = useGameStateContext()
  const { battleEffects } = useBattleContext()

  // UI state
  const [isMobile, setIsMobile] = useState(false)
  const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false)

  // Contract event listeners
  useWatchContractEvent({
    address: gameAddressParam,
    abi: gameAbi,
    eventName: 'RoundCompleted',
    onLogs: () => {
      refreshAllData()
      toast({
        title: "Round Completed",
        description: `Round has been completed`,
      })
    },
  })

  useWatchContractEvent({
    address: gameAddressParam,
    abi: gameAbi,
    eventName: "MoveSubmitted",
    onLogs() {
      refreshAllData()
      toast({
        title: "Move Submitted",
        description: "A move has been submitted",
      })
    },
  })

  useWatchContractEvent({
    address: gameAddressParam,
    abi: gameAbi,
    eventName: "PlayerAdded",
    onLogs() {
      refreshAllData()
    },
  })

  useWatchContractEvent({
    address: gameAddressParam,
    abi: gameAbi,
    eventName: "GameStarted",
    onLogs() {
      refreshAllData()
      toast({
        title: "Game Started",
        description: "The game has begun!",
      })
    },
  })

  // Handle mobile/desktop responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Game status and player information panel
  const GameStatusPanel = () => (
    <div className="w-full space-y-6 p-4">
      <GameStatus
        isLoading={isStatusLoading}
        currentPlayer={address ?? ''}
        gameStatus={gameStatus}
        totalPlayer={totalPlayer}
        maxPlayer={maxPlayer}
        playerAddresses={playerAddresses}
        setGameStatus={() => {}} // Context will handle this
        setTotalPlayer={() => {}} // Context will handle this
        fetchGameData={refreshAllData}
      />
      <GameOverview territories={[]} />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen md:mt-12 bg-slate-900">
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
          {isGridLoading ? (
            <Spinner />
          ) : (
            <ImprovedGameMapNew
              gameAddress={gameAddressParam}
              isMobile={isMobile}
              mobileBottomPanelOpen={mobileBottomPanelOpen}
              setMobileBottomPanelOpen={setMobileBottomPanelOpen}
            />
          )}
        </div>

        {/* Mobile operation panel */}
        {mobileBottomPanelOpen && (
          <GameOperationPanelNew
            gameAddress={gameAddressParam}
            isMobile={isMobile}
            setMobileBottomPanelOpen={setMobileBottomPanelOpen}
          />
        )}

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

// Main component with context provider
export default function GamePlayPageRefactored({ gameAddressParam }: GamePlayPageRefactoredProps) {
  return (
    <GameContextProvider gameAddress={gameAddressParam}>
      <GamePlayContent gameAddressParam={gameAddressParam} />
    </GameContextProvider>
  )
}