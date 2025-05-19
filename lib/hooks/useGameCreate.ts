import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import {
  GAME_FACTORY_ADDRESS,
  MONAD_GAME_FACTORY_ADDRESS,
} from "@/lib/constants/contracts";
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi";

type UseGameCreateReturn = {
  createGame: () => Promise<void>;
  isPending: boolean;
  error: Error | null;
  isConfirming: boolean;
  isConfirmed: boolean;
};

if (MONAD_GAME_FACTORY_ADDRESS === undefined) {
  throw new Error("MONAD_GAME_FACTORY_ADDRESS is not defined");
}

const factoryAddress = MONAD_GAME_FACTORY_ADDRESS as `0x${string}`;

export const useGameCreate = (): UseGameCreateReturn => {
  const { isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const createGame = async () => {
    if (!isConnected) throw new Error("Wallet not connected");
    const result = await writeContract({
      address: factoryAddress,
      abi: gameFactoryAbi,
      functionName: "createGame",
    });
    return result;
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash, // Transaction hash from the writeContract call
    });

  return { createGame, isPending, error, isConfirming, isConfirmed };
};
