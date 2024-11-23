import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { abi } from "@/lib/contract/abi";
import { Move } from "@/lib/types/game";
import { parseEther } from "viem";

interface UseMakeMoveReturn {
  makeMove: (move: Move) => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export const useMakeMove = (): UseMakeMoveReturn => {
  const { isConnected, address } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const makeMove = async (move: Move) => {
    if (!isConnected) throw new Error("Wallet not connected");

    console.log("move", move);

    //check caller is the player
    if (address !== move.player) throw new Error("Caller is not the player");

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: "makeMove",
        args: [
          {
            player: move.player,
            fromX: move.fromX,
            fromY: move.fromY,
            toX: move.toX,
            toY: move.toY,
            units: BigInt(move.units),
          },
        ],
      });
    } catch (err) {
      console.error("Error calling makeMove:", err);
      throw err;
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    makeMove,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
