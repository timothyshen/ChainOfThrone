import * as MultiBaas from "@curvegrid/multibaas-sdk";
import { isAxiosError } from "axios";

const config = new MultiBaas.Configuration({
  basePath: "https://tfb7e5aj3bbtdifchq7lw2qbby.multibaas.com/api/v0",
  accessToken: "<YOUR API KEY HERE>",
});
const contractsApi = new MultiBaas.ContractsApi(config);

const chain = "ethereum";
const deployedAddressOrLabel = "chainofthronev21";
const contractLabel = "chainofthronev2";
const contractMethod = "getGrid";
const payload: MultiBaas.PostMethodArgs = {
  args: [],
  from: "0xD74554760Adc11bB290E28BA7fc07C33923693ef",
};

try {
  const resp = await contractsApi.callContractFunction(
    chain,
    deployedAddressOrLabel,
    contractLabel,
    contractMethod,
    payload
  );
  console.log("Function call result:\n", resp.data.result);
} catch (e) {
  if (isAxiosError(e)) {
    console.log(
      `MultiBaas error with status '${e.response.data.status}' and message: ${e.response.data.message}`
    );
  } else {
    console.log("An unexpected error occurred:", e);
  }
}
import { useState, useCallback } from "react";
import { useAccount } from "wagmi";

export const useGetGrid = () => {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gridData, setGridData] = useState<any>(null);

  const getGrid = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const config = new MultiBaas.Configuration({
      basePath: "https://tfb7e5aj3bbtdifchq7lw2qbby.multibaas.com/api/v0",
      accessToken: process.env.NEXT_PUBLIC_CURVEGRID,
    });
    const contractsApi = new MultiBaas.ContractsApi(config);

    const payload: MultiBaas.PostMethodArgs = {
      args: [],
      from: address,
    };

    try {
      const resp = await contractsApi.callContractFunction(
        "ethereum",
        "chainofthronev21",
        "chainofthronev2",
        "getGrid",
        payload
      );
      setGridData(resp.data.result);
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
  }, [address]);

  return {
    getGrid,
    gridData,
    isLoading,
    error,
  };
};
