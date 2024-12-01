import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useReadContract,
} from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { gameAbi } from "@/lib/contract/gameAbi";

type Move = readonly [number, number, string, number, number, number];

interface UseMakeMoveReturn {
  makeMove: (move: Move) => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export const useMakeMove = (): UseMakeMoveReturn => {
  const { isConnected, address } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  // const { data: grid } = useReadContract({
  //   address: CONTRACT_ADDRESS,
  //   abi: gameAbi,
  //   functionName: "get2dGrid",
  // });

  const makeMove = async (move: Move) => {
    if (!isConnected) throw new Error("Wallet not connected");

    console.log("move", move);
    //check caller is the player
    if (address !== move[2]) throw new Error("Caller is not the player");

    try {
      // console.log("Making move with:", {
      //   player: move[2],
      //   fromX: Number(move[0]),
      //   fromY: Number(move[1]),
      //   toX: Number(move[3]),
      //   toY: Number(move[4]),
      //   units: BigInt(move[5]),
      // });

      // // Add this to check the current game state

      // console.log("Current grid state:", grid);
      // console.log("Checking cell:", grid[move[0]][move[1]]);

      await writeContract({
        address: CONTRACT_ADDRESS,
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
