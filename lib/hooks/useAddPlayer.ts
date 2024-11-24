import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { gameAbi } from "@/lib/contract/gameAbi";

type UseAddPlayerReturn = {
  addPlayer: () => `0x${string}` | undefined;
  isPending: boolean;
  error: Error | null;
  isConfirming: boolean;
  isConfirmed: boolean;
};

export const useAddPlayer = (): UseAddPlayerReturn => {
  const { isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const addPlayer = () => {
    if (!isConnected) throw new Error("Wallet not connected");

    console.log("writeContract", CONTRACT_ADDRESS);
    console.log("abi", gameAbi);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: gameAbi,
      functionName: "addPlayer",
      args: [],
    });

    return hash;
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash, // Transaction hash from the writeContract call
    });

  return { addPlayer, isPending, error, isConfirming, isConfirmed };
};
