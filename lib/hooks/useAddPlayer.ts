import * as MultiBaas from "@curvegrid/multibaas-sdk";
import { isAxiosError } from "axios";
import { useState, useCallback } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { CONTRACT_ADDRESS } from "../constants/contracts";

export const useAddPlayer = () => {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();

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
      const resp = await contractsApi.callContractFunction(
        "ethereum",
        "chainofthronev21",
        "chainofthronv2",
        "addPlayer",
        payload
      );
      //@ts-ignore
      console.log("resp", resp.data.result.tx);
      //@ts-ignore
      const tx = resp.data.result.tx;
      const result = await sendTransactionAsync(tx);
      console.log("result", result);
      return resp.data.result;
    } catch (e) {
      if (isAxiosError(e)) {
        const errorMessage = `MultiBaas error with status '${e.response?.data.status}' and message: ${e.response?.data.message}`;
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred");
      }
      throw e;
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
