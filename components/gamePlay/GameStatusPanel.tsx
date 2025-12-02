"use client";

import { memo } from "react";
import { useAccount } from "wagmi";
import GameStatus from "@/components/gamePlay/GameStatus/GameStatus";
import { GameOverview } from "./GameStatus/GameOverview";
import { useGameStateContext } from "@/lib/contexts/GameContext";

/**
 * GameStatusPanel Component
 *
 * Displays game status information and player overview
 * Used in both mobile drawer and desktop sidebar
 */
export const GameStatusPanel = memo(function GameStatusPanel() {
  const { address } = useAccount();
  const {
    gameStatus,
    totalPlayer,
    maxPlayer,
    playerAddresses,
    isStatusLoading,
    refreshAllData,
  } = useGameStateContext();

  return (
    <div className="w-full space-y-6 p-4">
      <GameStatus
        isLoading={isStatusLoading}
        currentPlayer={address ?? ""}
        gameStatus={gameStatus}
        totalPlayer={totalPlayer}
        maxPlayer={maxPlayer}
        playerAddresses={playerAddresses}
        setGameStatus={() => {}} // Context handles this
        setTotalPlayer={() => {}} // Context handles this
        fetchGameData={refreshAllData}
      />
      <GameOverview playerAddress={address} />
    </div>
  );
});
