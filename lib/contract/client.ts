import { sepolia, flowTestnet, scrollSepolia } from "viem/chains";
import { CONTRACT_ADDRESS } from "../constants/contracts";
import { gameAbi } from "./gameAbi";
import * as MultiBaas from "@curvegrid/multibaas-sdk";

import {
  http,
  createPublicClient,
  getContract,
  createWalletClient,
  custom,
} from "viem";

export const contractClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const gameContract = getContract({
  address: CONTRACT_ADDRESS,
  abi: gameAbi,
  client: contractClient,
});

export const config = new MultiBaas.Configuration({
  basePath: "https://tfb7e5aj3bbtdifchq7lw2qbby.multibaas.com/api/v0",
  accessToken: process.env.NEXT_PUBLIC_CURVEGRID,
});

export const chain = "ethereum";
export const deployedAddressOrLabel = "chainofthrone1";
export const contractLabel = "chainofthrone";
