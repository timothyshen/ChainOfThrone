import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { abi } from "@/lib/contract/abi";

type UseAddPlayerReturn = {
  addPlayer: () => `0x${string}` | undefined;
  isPending: boolean;
  error: Error | null;
};

export const useAddPlayer = (): UseAddPlayerReturn => {
  const { isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const addPlayer = () => {
    if (!isConnected) throw new Error("Wallet not connected");

    console.log("writeContract", CONTRACT_ADDRESS);
    console.log("abi", abi);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "addPlayer",
      args: [],
    });

    return hash;
  };

  return { addPlayer, isPending, error };
};
