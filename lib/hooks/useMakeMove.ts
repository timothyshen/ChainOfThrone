import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
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
  const { isConnected } = useAccount();

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
    if (!isConnected) throw new Error("Wallet not connected");
    if (!writeContract) throw new Error("writeContract is not initialized");
    console.log("fucking here");
    try {
      const result = await writeContract({
        address: CONTRACT_ADDRESS,
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
      debugger;
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
