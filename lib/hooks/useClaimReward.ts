import { useWriteContract } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";

interface UseClaimRewardReturn {
  claimReward: (gameAddress: `0x${string}`) => Promise<`0x${string}`>;
}

/**
 * Hook for claiming rewards
 *
 * State management has been moved to useTransaction hook
 * This hook only handles transaction execution logic
 *
 * Usage:
 * ```tsx
 * const tx = useTransaction()
 * const { claimReward } = useClaimReward()
 *
 * const handleClaim = async () => {
 *   await tx.execute(() => claimReward(gameAddress))
 * }
 * ```
 */
export const useClaimReward = (): UseClaimRewardReturn => {
  const { writeContractAsync } = useWriteContract();

  const claimReward = async (
    gameAddress: `0x${string}`
  ): Promise<`0x${string}`> => {
    const hash = await writeContractAsync({
      address: gameAddress,
      abi: gameAbi,
      functionName: "claimReward",
    });

    return hash;
  };

  return { claimReward };
};
