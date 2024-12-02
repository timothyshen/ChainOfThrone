import { contractClient } from "@/lib/contract/client";
import { gameAbi } from "@/lib/contract/gameAbi";

// View functions

export const getGrid = async (address: `0x${string}`) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "getGrid",
  });
  return result;
};

export const get2DGrid = async (address: `0x${string}`) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "get2dGrid",
  });
  return result;
};

// Public view variables

export const totalPlayers = async (address: `0x${string}`) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "totalPlayers",
  });
  return result;
};

export const idToAddress = async (address: `0x${string}`, id: number) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "idToAddress",
    args: [id],
  });
  return result;
};

export const addressToId = async (
  address: `0x${string}`,
  userAddress: `0x${string}`
) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "addressToId",
    args: [userAddress],
  });
  return result;
};

export const getGameStatus = async (address: `0x${string}`) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "gameStatus",
  });
  return result;
};

export const getRoundNumber = async (address: `0x${string}`) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "roundNumber",
  });
  return result;
};

export const getMaxPlayer = async (address: `0x${string}`) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "MAX_PLAYERS",
  });
  return result;
};

export const getRoundSubmitted = async (address: `0x${string}`, id: number) => {
  const result = await contractClient.readContract({
    address: address,
    abi: gameAbi,
    functionName: "roundSubmitted",
    args: [id],
  });
  return result;
};

export const getPlayerState = async (
  address: `0x${string}`,
  userAddress: `0x${string}`
) => {
  const playerId = await addressToId(address, userAddress);
  const playerState = await getRoundSubmitted(address, playerId as number);
  return playerState;
};
