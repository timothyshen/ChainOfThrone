import { contractClient } from "@/lib/contract/client";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi";

export const getGameList = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameFactoryAbi,
    functionName: "games",
  });
  return result;
};

export const getGamesInfo = async (startIdx: number, count: number) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameFactoryAbi,
    functionName: "getGamesInfo",
    args: [startIdx, count],
  });
  return result;
};

export const getTotalGames = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameFactoryAbi,
    functionName: "getGamesCount",
  });
  return result;
};
