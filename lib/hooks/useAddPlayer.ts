import * as MultiBaas from "@curvegrid/multibaas-sdk";
import { useState, useCallback } from "react";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";

export const useAddPlayer = (): UseAddPlayerReturn => {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();
  const { isConnected, data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  const config = new MultiBaas.Configuration({
    basePath: "https://tfb7e5aj3bbtdifchq7lw2qbby.multibaas.com/api/v0",
    accessToken: process.env.NEXT_PUBLIC_CURVEGRID,
  });
  const contractsApi = new MultiBaas.ContractsApi(config);

  const addPlayer = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("address", address);

    const payload: MultiBaas.PostMethodArgs = {
      args: [],
      from: address,
    };

    try {
      if (!isConnected) throw new Error("Wallet not connected");
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: abi.abi,
        functionName: "addPlayer",
        args: [],
      });
    } catch (err) {
      console.error("Error calling addPlayer:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addPlayer,
    isLoading,
    error,
  };
};
