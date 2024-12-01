import { contractClient } from "@/lib/contract/client";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { gameAbi } from "@/lib/contract/gameAbi";

// View functions

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

// Public view variables

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

export const addressToId = async (address: string) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "addressToId",
    args: [address],
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

export const getRoundSubmitted = async (id: number) => {
  const result = await contractClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: gameAbi,
    functionName: "roundSubmitted",
    args: [id],
  });
  return result;
};

export const getPlayerState = async (address: string) => {
  const playerId = await addressToId(address);
  const playerState = await getRoundSubmitted(playerId as string);
  return playerState;
};
