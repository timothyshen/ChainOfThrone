import { contractClient } from "@/lib/contract/client";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { gameAbi } from "@/lib/contract/gameAbi";
import { MakeMoveArgs } from "../types/setup";

export const totalPlayers = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "totalPlayers",
  });
  return result;
};

export const idToAddress = async (id: number) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "idToAddress",
    args: [id],
  });
  return result;
};

export const getGameStatus = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "gameStatus",
  });
  return result;
};

export const getGrid = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "getGrid",
  });
  return result;
};

export const get2DGrid = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "get2dGrid",
  });
  return result;
};

export const getRoundNumber = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "roundNumber",
  });
  return result;
};

export const getMaxPlayer = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "MAX_PLAYERS",
  });
  return result;
};

export const checkValidMove = async (args: MakeMoveArgs) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "checkValidMove",
    args: [
      {
        player: args.player,
        fromX: args.fromX,
        fromY: args.fromY,
        toX: args.toX,
        toY: args.toY,
        units: BigInt(args.units),
      },
    ],
  });
  return result;
};

export const currentListPlayer = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "currentListPlayer",
  });
  return result;
};
