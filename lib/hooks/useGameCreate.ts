import { useWriteContract, useAccount } from "wagmi";
import {
  GAME_FACTORY_ADDRESS,
  MONAD_GAME_FACTORY_ADDRESS,
} from "@/lib/constants/contracts";
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi";

interface UseGameCreateReturn {
  createGame: () => Promise<`0x${string}`>;
}

if (MONAD_GAME_FACTORY_ADDRESS === undefined) {
  throw new Error("MONAD_GAME_FACTORY_ADDRESS is not defined");
}

const factoryAddress = MONAD_GAME_FACTORY_ADDRESS as `0x${string}`;

/**
 * Hook for creating a new game
 *
 * 状态管理已移至 useTransaction hook
 * 此 hook 只负责执行交易逻辑
 *
 * 使用方法:
 * ```tsx
 * const tx = useTransaction()
 * const { createGame } = useGameCreate()
 *
 * const handleCreate = async () => {
 *   await tx.execute(() => createGame())
 * }
 * ```
 */
export const useGameCreate = (): UseGameCreateReturn => {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const createGame = async (): Promise<`0x${string}`> => {
    if (!isConnected) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: factoryAddress,
      abi: gameFactoryAbi,
      functionName: "createGame",
    });

    return hash;
  };

  return { createGame };
};
