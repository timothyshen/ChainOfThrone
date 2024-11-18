import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import abi from "@/lib/contract/abi.json";

type UseAddPlayerReturn = {
  addPlayer: () => Promise<`0x${string}` | undefined>;
  isPending: boolean;
  error: Error | null;
};

export const useAddPlayer = (): UseAddPlayerReturn => {
  const { isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const addPlayer = async () => {
    if (!isConnected) throw new Error("Wallet not connected");
    try {
      // Call writeContract directly without checking if it exists
      console.log("writeContract", writeContract);
      debugger;
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: abi.abi,
        functionName: "addPlayer",
        args: [],
      });
      return hash;
    } catch (err) {
      console.error("Error calling addPlayer:", err); // Updated error message
      throw err;
    }
  };

  return { addPlayer, isPending, error };
};
