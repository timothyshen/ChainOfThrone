/**
 * Multicall Utilities for Batch Contract Reads
 *
 * Reduces RPC calls by batching multiple contract reads into a single multicall.
 * Uses wagmi's readContracts action with viem under the hood.
 *
 * @see CLAUDE.md - Sprint 4 optimization for contract interaction efficiency
 */

import { readContracts } from "wagmi/actions";
import { wagmiConfig } from "@/lib/providers/DynamicProvider";
import { gameAbi } from "@/lib/contract/gameAbi";

/**
 * Batch read multiple game contract functions in a single RPC call
 *
 * @param gameAddress - The game contract address
 * @param calls - Array of function names to call
 * @returns Promise with array of results matching input order
 *
 * @example
 * const [status, totalPlayers, maxPlayer] = await batchReadGameContract(
 *   gameAddress,
 *   ['gameStatus', 'totalPlayers', 'getMaxPlayer']
 * )
 */
export async function batchReadGameContract(
  gameAddress: `0x${string}`,
  calls: Array<{ functionName: string; args?: readonly unknown[] }>
) {
  const contracts = calls.map((call) => ({
    address: gameAddress,
    abi: gameAbi,
    functionName: call.functionName,
    args: call.args || [],
  }));

  try {
    const results = await readContracts(wagmiConfig, {
      contracts: contracts as any,
    });

    return results.map((result, index) => {
      if (!result || result.status === "failure") {
        console.error(
          `Multicall failed for ${calls[index]?.functionName || "unknown"}:`,
          result?.error || "No result"
        );
        return null;
      }
      return result.result;
    });
  } catch (error) {
    console.error("Batch read contract error:", error);
    throw error;
  }
}

/**
 * Batch read game data including player addresses
 *
 * @param gameAddress - The game contract address
 * @param totalPlayers - Number of players to fetch
 * @returns Complete game data in a single multicall
 */
export async function batchReadGameData(
  gameAddress: `0x${string}`,
  totalPlayers: number
) {
  const baseCalls = [
    { functionName: "gameStatus" },
    { functionName: "totalPlayers" },
    { functionName: "getMaxPlayer" },
  ];

  // Add player-specific calls
  const playerCalls = [];
  for (let i = 0; i < totalPlayers; i++) {
    playerCalls.push(
      { functionName: "idToAddress", args: [i] as const },
      { functionName: "roundSubmitted", args: [i] as const }
    );
  }

  const allCalls = [...baseCalls, ...playerCalls];
  const results = await batchReadGameContract(gameAddress, allCalls);

  // Parse results
  const [status, totalPlayersResult, maxPlayer, ...playerResults] = results;

  // Group player data (address, roundSubmitted pairs)
  const players = [];
  for (let i = 0; i < playerResults.length; i += 2) {
    players.push({
      address: playerResults[i] as string,
      roundSubmitted: playerResults[i + 1] as boolean,
    });
  }

  return {
    status,
    totalPlayers: totalPlayersResult,
    maxPlayer,
    players,
  };
}
