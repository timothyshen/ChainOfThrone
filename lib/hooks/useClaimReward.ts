import { useWriteContract } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";

interface UseClaimRewardReturn {
  claimReward: (gameAddress: `0x${string}`) => Promise<`0x${string}`>;
}

/**
 * Hook for claiming rewards
 *
 * 状态管理已移至 useTransaction hook
 * 此 hook 只负责执行交易逻辑
 *
 * 使用方法:
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
