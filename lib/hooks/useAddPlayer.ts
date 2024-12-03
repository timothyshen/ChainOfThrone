import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { gameAbi } from "@/lib/contract/gameAbi";

type UseAddPlayerReturn = {
  addPlayer: (address: `0x${string}`) => `0x${string}` | undefined;
  isPending: boolean;
  error: Error | null;
  isConfirming: boolean;
  isConfirmed: boolean;
};

export const useAddPlayer = (): UseAddPlayerReturn => {
  const { isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const addPlayer = (address: `0x${string}`) => {
    if (!isConnected) throw new Error("Wallet not connected");

    console.log("abi", gameAbi);
    writeContract({
      address: address,
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
