import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import abi from "@/lib/contract/abi.json";
import { MakeMoveArgs } from "@/lib/types/setup";

interface UseMakeMoveReturn {
  makeMove: (args: MakeMoveArgs) => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export const useMakeMove = (): UseMakeMoveReturn => {
  // Initialize the writeContract hook from wagmi
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  // Define the function to call the buy method on the Bodhi contract
  const makeMove = async ({
    player,
    fromX,
    fromY,
    toX,
    toY,
    units,
  }: MakeMoveArgs) => {
    if (!writeContract) {
      console.error("writeContract is not initialized");
      return;
    }
    console.log("fucking here");
    try {
      const result = await writeContract({
        address: "0x4e3eEd3c8315dbBD07Ef3C76ad22eEbc63B59ddB" as `0x${string}`,
        abi: abi.abi,
        functionName: "makeMove",
        args: [
          {
            player: player,
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            units: units,
          },
        ],
      });

      console.log("Transaction submitted:", result);
      return result;
    } catch (err) {
      console.log("fucking here");
      console.error("Error calling makeMove:", err);
      throw err;
    }
  };

  // Initialize the useWaitForTransactionReceipt hook to track transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash, // Transaction hash from the writeContract call
    });

  return {
    makeMove,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
