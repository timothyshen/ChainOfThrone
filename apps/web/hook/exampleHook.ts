import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
// import { xxx } from "../../../contract-config/typechain";
// import { parseEther } from "viem";
// import { xx } from "@/constant/contract-sepolia";

interface UseExampleContractReturn {
  exampleContract: (
    id: bigint,
    amount: number,
    ethPrice: string,
  ) => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export const useExampleContract = (): UseExampleContractReturn => {
  // Initialize the writeContract hook from wagmi
  const { data: hash, error, isPending } = useWriteContract();

  // Define the function to call the buy method on the Bodhi contract
  const exampleContract = async () => {
    try {
      // Call the writeContract method with the specified parameters
      // await writeContract({
      //   address: BodhiAddress as `0x${string}`, // Cast BodhiAddress to the appropriate type
      //   abi: "", // ABI for the Bodhi contract
      //   functionName: "buy", // Function name to call
      //   value: parseEther(ethPrice), // Convert ethPrice to Wei
      //   args: [id, amountBigInt], // Arguments for the function
      // });
    } catch (err) {
      // Log any errors that occur
      console.error("Error calling bodhiBuy:", err);
    }
  };

  // Initialize the useWaitForTransactionReceipt hook to track transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash, // Transaction hash from the writeContract call
    });

  return {
    exampleContract,
    isPending, // Pending state from writeContract hook
    isConfirming, // Confirming state from useWaitForTransactionReceipt hook
    isConfirmed, // Confirmed state from useWaitForTransactionReceipt hook
    error, // Error state from writeContract hook
  };
};
