import { useWriteContract, useAccount } from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";

type Move = readonly [number, number, string, number, number, number];

interface UseMakeMoveReturn {
  makeMove: (address: `0x${string}`, move: Move) => Promise<`0x${string}`>;
}

/**
 * Hook for making moves in the game
 *
 * 状态管理已移至 useTransaction hook
 * 此 hook 只负责执行交易逻辑
 *
 * 使用方法:
 * ```tsx
 * const tx = useTransaction()
 * const { makeMove } = useMakeMove()
 *
 * const handleMove = async () => {
 *   await tx.execute(() => makeMove(gameAddress, move))
 * }
 * ```
 */
export const useMakeMove = (): UseMakeMoveReturn => {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const makeMove = async (
    gameAddress: `0x${string}`,
    move: Move
  ): Promise<`0x${string}`> => {
    if (!isConnected) throw new Error("Wallet not connected");

    // 验证调用者是玩家
    if (address !== move[2]) throw new Error("Caller is not the player");

    const hash = await writeContractAsync({
      address: gameAddress,
      abi: gameAbi,
      functionName: "makeMove",
      args: [
        {
          player: move[2],
          fromX: Number(move[0]),
          fromY: Number(move[1]),
          toX: Number(move[3]),
          toY: Number(move[4]),
          units: BigInt(move[5]),
        },
      ],
    });

    return hash;
  };

  return { makeMove };
};
