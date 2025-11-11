import { useWriteContract, useAccount } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";
import { parseEther } from "viem";

interface UseAddPlayerReturn {
  addPlayer: (address: `0x${string}`) => Promise<`0x${string}`>;
}

/**
 * Hook for adding a player to the game
 *
 * State management has been moved to useTransaction hook
 * This hook only handles transaction execution logic
 *
 * Usage:
 * ```tsx
 * const tx = useTransaction()
 * const { addPlayer } = useAddPlayer()
 *
 * const handleJoin = async () => {
 *   await tx.execute(() => addPlayer(gameAddress))
 * }
 * ```
 */
export const useAddPlayer = (): UseAddPlayerReturn => {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const addPlayer = async (address: `0x${string}`): Promise<`0x${string}`> => {
    if (!isConnected) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: address,
      abi: gameAbi,
      functionName: "addPlayer",
      args: [],
      value: parseEther("0.1"),
    });

    return hash;
  };

  return { addPlayer };
};
