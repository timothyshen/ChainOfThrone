"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { GameStatusEnum, GameStatusProps } from "@/lib/types/gameStatus";
import { getWinner } from "@/lib/hooks/ReadGameContract";
import { useGameAddress } from "@/lib/hooks/useGameAddress";
import { usePlayerJoinGame } from "@/lib/hooks/usePlayerJoinGame";
import { useGameContractEvents } from "@/lib/hooks/useGameContractEvents";
import { DiplomacyResultModal } from "../GameCompleteModal";

// Sub-components
import { GameStatsCards } from "./GameStatsCards";
import { PlayerListCard } from "./PlayerListCard";
import { JoinGameButton } from "./JoinGameButton";

const winStats = {
  supplyCenters: 18,
  territories: 22,
  alliances: 4,
  totalYears: 7,
};

export default function GameStatus({
  isLoading,
  currentPlayer,
  gameStatus,
  totalPlayer,
  maxPlayer,
  playerAddresses,
  setGameStatus,
  setTotalPlayer,
  fetchGameData,
}: GameStatusProps) {
  const { gameAddress } = useGameAddress();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Use the player join hook
  const { handleJoin, txState } = usePlayerJoinGame({
    gameAddress: gameAddress ?? undefined,
    onStatusUpdate: setGameStatus,
    onTotalPlayerUpdate: setTotalPlayer,
    onSuccess: fetchGameData,
  });

  // Use consolidated contract events hook
  useGameContractEvents({
    gameAddress: gameAddress as `0x${string}` | undefined,
    onRefresh: fetchGameData,
    showToasts: false, // Parent component handles toasts
  });

  // Check for winner when game completes
  useEffect(() => {
    async function checkWinner() {
      if (gameStatus === GameStatusEnum.COMPLETED) {
        if (!gameAddress) return;
        const winnerAddress = await getWinner(gameAddress);
        setWinner(winnerAddress as string);
        setShowCompleteModal(true);
      }
    }
    checkWinner();
  }, [gameStatus, gameAddress]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-6">
        {/* Stats Cards */}
        <GameStatsCards
          totalPlayer={totalPlayer}
          maxPlayer={maxPlayer}
          gameStatus={gameStatus}
        />

        {/* Players List */}
        <PlayerListCard
          players={playerAddresses}
          currentPlayer={currentPlayer}
        />

        {/* Join Button */}
        <JoinGameButton
          isFull={totalPlayer === maxPlayer}
          txState={txState}
          onJoin={handleJoin}
        />
      </div>

      {/* Game Complete Modal */}
      {gameAddress && (
        <DiplomacyResultModal
          gameAddress={gameAddress}
          type={winner === currentPlayer ? "win" : "loss"}
          open={showCompleteModal && gameStatus === GameStatusEnum.COMPLETED}
          onOpenChange={setShowCompleteModal}
          year="Fall, 1908"
          stats={winStats}
        />
      )}
    </div>
  );
}
