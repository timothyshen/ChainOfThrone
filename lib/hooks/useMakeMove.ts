import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useReadContract,
} from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";

type Move = readonly [number, number, string, number, number, number];

interface UseMakeMoveReturn {
  makeMove: (address: `0x${string}`, move: Move) => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export const useMakeMove = (): UseMakeMoveReturn => {
  const { isConnected, address } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const makeMove = async (gameAddress: `0x${string}`, move: Move) => {
    if (!isConnected) throw new Error("Wallet not connected");

    console.log("move", move);
    //check caller is the player
    console.log("address", address);
    if (address !== move[2]) throw new Error("Caller is not the player");

    try {
      await writeContract({
        address: gameAddress,
        abi: gameAbi,
        functionName: "makeMove",
        args: [
          {
            player: move[2],
            fromX: Number(move[0]), // Convert string to number for uint8
            fromY: Number(move[1]), // Convert string to number for uint8
            toX: Number(move[3]), // Convert string to number for uint8
            toY: Number(move[4]), // Convert string to number for uint8
            units: BigInt(move[5]), // Convert string/number to BigInt for uint256
          },
        ],
      });
    } catch (err) {
      console.error("Error calling makeMove:", err);
      throw err;
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    makeMove,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
