"use client";

import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import { TransactionButton } from "@/components/shared/TransactionButton";
import type { TxState } from "@/lib/types/transaction";

interface JoinGameButtonProps {
  isFull: boolean;
  txState: TxState;
  onJoin: () => void;
}

export function JoinGameButton({ isFull, txState, onJoin }: JoinGameButtonProps) {
  if (isFull) {
    return (
      <Button disabled className="w-full">
        <UserPlus className="mr-2 h-4 w-4" />
        Game is full
      </Button>
    );
  }

  return (
    <TransactionButton
      state={txState}
      onClick={onJoin}
      idleText={
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Join Game
        </>
      }
      signingText="Sign in Wallet"
      submittedText={
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      }
      confirmingText={
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Confirming...
        </>
      }
      successText="✓ Joined!"
      errorText="Try Again"
      className="w-full"
    />
  );
}
