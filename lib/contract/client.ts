import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESS } from "../constants/contracts";
import { abi } from "./abi.json";

import { http, createPublicClient, getContract } from "viem";

export const contractClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const gameContract = getContract({
  address: CONTRACT_ADDRESS,
  abi,
  client: contractClient,
});
