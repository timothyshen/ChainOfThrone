import { contractClient } from "@/lib/contract/client";
import {
  GAME_FACTORY_ADDRESS,
  MONAD_GAME_FACTORY_ADDRESS,
} from "@/lib/constants/contracts";
import { gameFactoryAbi } from "@/lib/contract/gameFactoryAbi";

if (MONAD_GAME_FACTORY_ADDRESS === undefined) {
  throw new Error("MONAD_GAME_FACTORY_ADDRESS is not defined");
}

const factoryAddress = MONAD_GAME_FACTORY_ADDRESS as `0x${string}`;

export const getGameList = async () => {
  const result = await contractClient.readContract({
    address: factoryAddress,
    abi: gameFactoryAbi,
    functionName: "games",
  });
  return result;
};

export const getGamesInfo = async () => {
  const result = await contractClient.readContract({
    address: factoryAddress,
    abi: gameFactoryAbi,
    functionName: "getGamesInfo",
  });
  console.log("result", result);
  return result;
};

export const getTotalGames = async () => {
  const result = await contractClient.readContract({
    address: factoryAddress,
    abi: gameFactoryAbi,
    functionName: "getGamesCount",
  });
  return result;
};
