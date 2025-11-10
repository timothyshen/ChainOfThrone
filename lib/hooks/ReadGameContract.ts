import { contractClient } from "@/lib/contract/client";
import { gameAbi } from "@/lib/contract/gameAbi";

/**
 * Wrapper for contract reads with error handling
 * Provides graceful degradation and useful error messages
 */
async function safeReadContract<T>(
  params: {
    address: `0x${string}`;
    functionName: string;
    args?: readonly unknown[];
  },
  fallback?: T
): Promise<T | null> {
  try {
    const result = await contractClient.readContract({
      address: params.address,
      abi: gameAbi,
      functionName: params.functionName,
      args: params.args,
    });
    return result as T;
  } catch (error) {
    console.error(
      `Error reading ${params.functionName} from contract ${params.address}:`,
      error
    );
    return fallback !== undefined ? fallback : null;
  }
}

// View functions

export const getGrid = async (address: `0x${string}`) => {
  return safeReadContract({
    address,
    functionName: "getGrid",
  });
};

export const get2DGrid = async (address: `0x${string}`) => {
  return safeReadContract({
    address,
    functionName: "get2dGrid",
  });
};

// Public view variables

export const totalPlayers = async (address: `0x${string}`) => {
  return safeReadContract<number>({
    address,
    functionName: "totalPlayers",
  }, 0);
};

export const idToAddress = async (address: `0x${string}`, id: number) => {
  return safeReadContract<`0x${string}`>({
    address,
    functionName: "idToAddress",
    args: [id],
  });
};

export const addressToId = async (
  address: `0x${string}`,
  userAddress: `0x${string}`
): Promise<number> => {
  const result = await safeReadContract<number>({
    address,
    functionName: "addressToId",
    args: [userAddress],
  }, 0);
  return result ?? 0;
};

export const getGameStatus = async (address: `0x${string}`) => {
  return safeReadContract<number>({
    address,
    functionName: "gameStatus",
  }, 0);
};

export const getRoundNumber = async (address: `0x${string}`) => {
  return safeReadContract<number>({
    address,
    functionName: "roundNumber",
  }, 0);
};

export const getMaxPlayer = async (address: `0x${string}`) => {
  return safeReadContract<number>({
    address,
    functionName: "MAX_PLAYERS",
  }, 2);
};

export const getRoundSubmitted = async (address: `0x${string}`, id: number) => {
  return safeReadContract<boolean>({
    address,
    functionName: "roundSubmitted",
    args: [id],
  }, false);
};

export const getPlayerState = async (
  address: `0x${string}`,
  userAddress: `0x${string}`
) => {
  try {
    const playerId = await addressToId(address, userAddress);
    const playerState = await getRoundSubmitted(address, playerId as number);
    return playerState;
  } catch (error) {
    console.error(`Error fetching player state for ${userAddress}:`, error);
    return false;
  }
};

export const getWinner = async (address: `0x${string}`) => {
  return safeReadContract<`0x${string}`>({
    address,
    functionName: "getWinner",
  });
};

export const getWinnerAmount = async (address: `0x${string}`) => {
  return safeReadContract<bigint>({
    address,
    functionName: "getWinnerAmount",
  }, BigInt(0));
};
