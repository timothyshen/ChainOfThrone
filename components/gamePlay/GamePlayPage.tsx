"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { logger } from "@/lib/utils/logger";
import { Spinner } from "../ui/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChevronDown } from "lucide-react";

// Components
import GameOperationPanel from "@/components/gamePlay/GameMap/GameOperationPanel";
import GameMap from "@/components/gamePlay/GameMap";
import BattleEffectOverlay from "@/components/gamePlay/GameMap/BattleEffectOverlay";
import { MissedRoundsNotification } from "./MissedRoundsNotification";
import { GameStatusPanel } from "./GameStatusPanel";
import { TurnHistoryPanel } from "./GameMap/panels/TurnHistoryPanel";

// Context
import {
  GameContextProvider,
  useGameStateContext,
  useBattleContext,
} from "@/lib/contexts/GameContext";

// Hooks
import { useRoundAnimation } from "@/lib/hooks/useRoundAnimation";
import { useGamePlayEvents } from "@/lib/hooks/useGamePlayEvents";
import { useMobileDetection } from "@/lib/hooks/useMobileDetection";
import { getRoundNumber } from "@/lib/hooks/ReadGameContract";

// Types
import { MissedRoundsInfo } from "@/lib/systems/RoundHistoryManager";

interface GamePlayPageProps {
  gameAddressParam: `0x${string}`;
}

/**
 * Inner component that has access to GameContext
 */
function GamePlayContent({ gameAddressParam }: GamePlayPageProps) {
  const { toast } = useToast();
  const { isMobile } = useMobileDetection();

  // Context hooks
  const { isGridLoading, refreshAllData } = useGameStateContext();
  const { battleEffects } = useBattleContext();

  // UI state
  const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false);
  const [missedRoundsInfo, setMissedRoundsInfo] =
    useState<MissedRoundsInfo | null>(null);

  // Round animation system
  const { isAnimating, playRoundTransition, checkForMissedRounds, playMissedRounds } =
    useRoundAnimation({
      gameAddress: gameAddressParam,
      onMissedRounds: (info) => {
        setMissedRoundsInfo(info);
        toast({
          title: "Missed Rounds",
          description: `You missed ${info.missedRounds.length} rounds. Check notification for replay.`,
          variant: "default",
        });
      },
      autoPlayMissedRounds: false,
    });

  // Contract event listeners
  useGamePlayEvents({
    gameAddress: gameAddressParam,
    isAnimating,
    refreshAllData,
    playRoundTransition,
  });

  // Check for missed rounds on mount
  useEffect(() => {
    const checkMissedOnMount = async () => {
      if (!gameAddressParam) return;

      try {
        const currentRound = await getRoundNumber(gameAddressParam);

        if (currentRound && currentRound > 0) {
          const info = checkForMissedRounds();

          if (info && info.hasMissedRounds) {
            logger.log(
              `Found ${info.missedRounds.length} missed rounds on mount:`,
              info.missedRounds
            );
          }
        }
      } catch (error) {
        logger.error("Error checking missed rounds on mount:", error);
      }
    };

    checkMissedOnMount();
  }, [gameAddressParam, checkForMissedRounds]);

  // Handle missed rounds replay
  const handleViewReplay = useCallback(async () => {
    if (!missedRoundsInfo) return;

    logger.log(
      `Playing replay for ${missedRoundsInfo.missedRounds.length} rounds`
    );

    try {
      await playMissedRounds(missedRoundsInfo.missedRounds);

      toast({
        title: "Replay Complete",
        description: "You're now up to date!",
      });

      setMissedRoundsInfo(null);
    } catch (error) {
      logger.error("Error playing missed rounds replay:", error);
      toast({
        title: "Replay Failed",
        description: "Could not play missed rounds. Try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [missedRoundsInfo, playMissedRounds, toast]);

  return (
    <div className="flex flex-col h-screen md:mt-12 bg-background">
      {/* Missed Rounds Notification */}
      <MissedRoundsNotification
        missedRoundsInfo={missedRoundsInfo}
        onViewReplay={handleViewReplay}
        onDismiss={() => setMissedRoundsInfo(null)}
      />

      {/* Mobile status drawer */}
      <div className="md:hidden py-2 px-4 flex-shrink-0">
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
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Game map section */}
        <div className="flex-1 overflow-hidden">
          {isGridLoading ? (
            <div className="h-full flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <GameMap
              gameAddress={gameAddressParam}
              isMobile={isMobile}
              setMobileBottomPanelOpen={setMobileBottomPanelOpen}
            />
          )}
        </div>

        {/* Mobile operation panel */}
        <GameOperationPanel
          gameAddress={gameAddressParam}
          isMobile={isMobile}
          mobileBottomPanelOpen={mobileBottomPanelOpen}
          setMobileBottomPanelOpen={setMobileBottomPanelOpen}
        />

        {/* Battle Effects Overlay */}
        {battleEffects.length > 0 && (
          <BattleEffectOverlay battleEffects={battleEffects} />
        )}

        {/* Desktop side panel */}
        <div className="hidden md:block md:w-1/3 p-4 space-y-4 overflow-auto flex-shrink-0">
          <GameStatusPanel />
          <GameOperationPanel
            gameAddress={gameAddressParam}
            isMobile={false}
            mobileBottomPanelOpen={false}
            setMobileBottomPanelOpen={() => {}}
          />
          <TurnHistoryPanel
            isCollapsible={true}
            defaultExpanded={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * GamePlayPage Component
 *
 * Main game play page with context provider wrapper
 */
export default function GamePlayPage({ gameAddressParam }: GamePlayPageProps) {
  return (
    <GameContextProvider gameAddress={gameAddressParam}>
      <GamePlayContent gameAddressParam={gameAddressParam} />
    </GameContextProvider>
  );
}
