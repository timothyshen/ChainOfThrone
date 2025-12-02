"use client";

import { useCallback, useEffect } from "react";
import { useAddPlayer } from "@/lib/hooks/useAddPlayer";
import { useTransaction } from "@/lib/hooks/useTransaction";
import { useTransactionToast } from "@/lib/hooks/useTransactionToast";
import { getGameStatus, totalPlayers } from "@/lib/hooks/ReadGameContract";
import { getGameStatusText } from "@/lib/utils/gameStatus";
import { GameStatusEnum } from "@/lib/types/gameStatus";
import { logger } from "@/lib/utils/logger";

interface UsePlayerJoinGameOptions {
  gameAddress: string | undefined;
  onStatusUpdate: (status: GameStatusEnum) => void;
  onTotalPlayerUpdate: (total: number) => void;
  onSuccess?: () => void;
}

interface UsePlayerJoinGameReturn {
  handleJoin: () => Promise<void>;
  txState: ReturnType<typeof useTransaction>["state"];
  isJoining: boolean;
}

export function usePlayerJoinGame({
  gameAddress,
  onStatusUpdate,
  onTotalPlayerUpdate,
  onSuccess,
}: UsePlayerJoinGameOptions): UsePlayerJoinGameReturn {
  const { addPlayer } = useAddPlayer();
  const tx = useTransaction();

  // Automatically display transaction status notifications
  useTransactionToast(tx.state, {
    success: "You have successfully joined the game!",
    error: "Failed to join game",
  });

  // Refresh game data after transaction success
  useEffect(() => {
    if (tx.isSuccess && onSuccess) {
      onSuccess();
    }
  }, [tx.isSuccess, onSuccess]);

  const handleJoin = useCallback(async () => {
    if (!gameAddress) return;

    try {
      // Execute transaction and wait for confirmation
      await tx.execute(() => addPlayer(gameAddress));

      // After transaction is confirmed, update game state
      const [status, total] = await Promise.all([
        getGameStatus(gameAddress as `0x${string}`),
        totalPlayers(gameAddress as `0x${string}`),
      ]);

      onStatusUpdate(getGameStatusText(status as number));
      onTotalPlayerUpdate(total as number);
    } catch (error) {
      // Error already displayed via useTransactionToast
      logger.error("Failed to join game:", error);
    }
  }, [gameAddress, tx, addPlayer, onStatusUpdate, onTotalPlayerUpdate]);

  return {
    handleJoin,
    txState: tx.state,
    isJoining: tx.isPending,
  };
}
