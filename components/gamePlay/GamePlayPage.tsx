"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/lib/hooks/use-toast";
import { logger } from "@/lib/utils/logger";
import { Spinner } from "../ui/spinner";

// Components
import GameOperationPanel from "@/components/gamePlay/GameMap/GameOperationPanel";
import GameMap from "@/components/gamePlay/GameMap";
import BattleEffectOverlay from "@/components/gamePlay/GameMap/BattleEffectOverlay";
import { MissedRoundsNotification } from "./MissedRoundsNotification";
import { GameStatusPanel } from "./GameStatusPanel";
import { TurnHistoryPanel } from "./GameMap/panels/TurnHistoryPanel";
import { MiniStatusBar } from "./MiniStatusBar";
import { ContextualActionBar } from "./GameMap/ContextualActionBar";

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

  // Mobile layout
  // Header: 56px, MiniStatusBar: 48px, ActionBar: ~56px, BottomNav: 64px
  if (isMobile) {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden">
        {/* Missed Rounds Notification - Floating */}
        <MissedRoundsNotification
          missedRoundsInfo={missedRoundsInfo}
          onViewReplay={handleViewReplay}
          onDismiss={() => setMissedRoundsInfo(null)}
        />

        {/* Top: Mini Status Bar - Fixed below header (56px) */}
        <div className="fixed left-0 right-0 z-40" style={{ top: "56px" }}>
          <MiniStatusBar />
        </div>

        {/* Middle: Game Map - Between status bar and action bar */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{
            top: "104px", /* header (56px) + status bar (48px) */
            bottom: "120px" /* action bar (~56px) + bottom nav (64px) */
          }}
        >
          {isGridLoading ? (
            <Spinner />
          ) : (
            <GameMap
              gameAddress={gameAddressParam}
              isMobile={true}
              setMobileBottomPanelOpen={setMobileBottomPanelOpen}
            />
          )}
        </div>

        {/* Bottom: Contextual Action Bar - Fixed above bottom nav (64px) */}
        <div className="fixed left-0 right-0 z-40" style={{ bottom: "64px" }}>
          <ContextualActionBar />
        </div>

        {/* Mobile Operation Drawer - on demand */}
        <GameOperationPanel
          gameAddress={gameAddressParam}
          isMobile={true}
          mobileBottomPanelOpen={mobileBottomPanelOpen}
          setMobileBottomPanelOpen={setMobileBottomPanelOpen}
        />

        {/* Battle Effects Overlay */}
        {battleEffects.length > 0 && (
          <BattleEffectOverlay battleEffects={battleEffects} />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] mt-12 bg-background overflow-hidden">
      {/* Missed Rounds Notification */}
      <MissedRoundsNotification
        missedRoundsInfo={missedRoundsInfo}
        onViewReplay={handleViewReplay}
        onDismiss={() => setMissedRoundsInfo(null)}
      />

      {/* Main game layout */}
      <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
        {/* Game map section */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isGridLoading ? (
            <div className="h-full flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <GameMap
              gameAddress={gameAddressParam}
              isMobile={false}
              setMobileBottomPanelOpen={() => {}}
            />
          )}
        </div>

        {/* Battle Effects Overlay */}
        {battleEffects.length > 0 && (
          <BattleEffectOverlay battleEffects={battleEffects} />
        )}

        {/* Desktop side panel */}
        <div className="flex flex-col w-1/3 max-w-md p-4 space-y-4 overflow-hidden flex-shrink-0">
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
