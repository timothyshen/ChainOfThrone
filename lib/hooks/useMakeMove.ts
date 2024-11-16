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
  const makeMove = async ({ fromX, fromY, toX, toY, units }: MakeMoveArgs) => {
    try {
      // Call the writeContract method with the specified parameters
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`, // Cast BodhiAddress to the appropriate type
        abi: abi.abi, // ABI for the Bodhi contract
        functionName: "makeMove", // Function name to call
        args: [fromX, fromY, toX, toY, units], // Arguments for the function
      });
    } catch (err) {
      // Log any errors that occur
      console.error("Error calling makeMove:", err);
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
