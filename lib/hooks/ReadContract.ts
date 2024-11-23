import { contractClient } from "@/lib/contract/client";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { abi } from "@/lib/contract/abi";
import { MakeMoveArgs } from "../types/setup";

export const totalPlayers = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "totalPlayers",
  });
  return result;
};

export const idToAddress = async (id: number) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "idToAddress",
    args: [id],
  });
  return result;
};

export const getGameStatus = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "gameStatus",
  });
  return result;
};

export const getGrid = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "getGrid",
  });
  return result;
};

export const get2DGrid = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "get2dGrid",
  });
  return result;
};

export const getRoundNumber = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "roundNumber",
  });
  return result;
};

export const getMaxPlayer = async () => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "MAX_PLAYERS",
  });
  return result;
};

export const checkValidMove = async (args: MakeMoveArgs) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
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
    abi: abi,
    functionName: "currentListPlayer",
  });
  return result;
};
