import { contractClient } from "@/lib/contract/client";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import abi from "@/lib/contract/abi.json";

export const totalPlayers = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "totalPlayers",
  });
  console.log(result);
  return result;
};

export const idToAddress = async (id: number) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "idToAddress",
    args: [id],
  });
  return result;
};

export const getGameStatus = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "gameStatus",
  });
  return result;
};

export const getGrid = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "getGrid",
  });
  return result;
};

export const get2DGrid = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "get2dGrid",
  });
  return result;
};

export const getRoundNumber = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "roundNumber",
  });
  return result;
};

export const getMaxPlayer = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi.abi,
    functionName: "MAX_PLAYERS",
  });
  return result;
};
