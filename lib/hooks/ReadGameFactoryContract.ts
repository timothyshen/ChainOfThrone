import { contractClient } from "@/lib/contract/client";
import {
  GAME_FACTORY_ADDRESS,
  MONAD_GAME_FACTORY_ADDRESS,
} from "@/lib/constants/contracts";
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi";

export const getGameList = async () => {
  const result = await contractClient.readContract({
    address: MONAD_GAME_FACTORY_ADDRESS,
    abi: gameFactoryAbi,
    functionName: "games",
  });
  return result;
};

export const getGamesInfo = async (startIdx: number, count: number) => {
  const result = await contractClient.readContract({
    address: MONAD_GAME_FACTORY_ADDRESS,
    abi: gameFactoryAbi,
    functionName: "getGamesInfo",
    args: [startIdx, count],
  });
  console.log(result);
  return result;
};

export const getTotalGames = async () => {
  const result = await contractClient.readContract({
    address: MONAD_GAME_FACTORY_ADDRESS,
    abi: gameFactoryAbi,
    functionName: "getGamesCount",
  });
  return result;
};
