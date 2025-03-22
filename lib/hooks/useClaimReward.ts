import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useReadContract,
} from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";

export const useClaimReward = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const claimReward = async (gameAddress: `0x${string}`) => {
    try {
      await writeContract({
        address: gameAddress,
        abi: gameAbi,
        functionName: "claimReward",
      });
    } catch (err) {
      console.error("Error calling claimReward", err);
      throw err;
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    claimReward,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
