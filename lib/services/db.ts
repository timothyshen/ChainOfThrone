import { PrismaClient } from "@prisma/client";
import { GameHistory } from "@/lib/types/setup";

const prisma = new PrismaClient();

export async function addGameHistory(game: GameHistory) {
  try {
    // Create or update players
    const playerPromises = game.players.map(async (address) => {
      const player = await prisma.player.upsert({
        where: { address },
        update: {},
        create: { address },
      });
      return player;
    });

    const players = await Promise.all(playerPromises);

    // Create the game
    const newGame = await prisma.game.create({
      data: {
        gameAddress: game.gameAddress,
        winner: game.winner,
        timestamp: new Date(game.timestamp),
        totalRounds: game.totalRounds,
        players: {
          connect: players.map((p) => ({ id: p.id })),
        },
      },
    });

    // Update player stats
    await Promise.all(
      players.map(async (player) => {
        const stats = await prisma.playerStats.upsert({
          where: { playerId: player.id },
          update: {
            totalGames: { increment: 1 },
            wins: { increment: player.address === game.winner ? 1 : 0 },
            lastWinTimestamp:
              player.address === game.winner
                ? new Date(game.timestamp)
                : undefined,
            winRate: {
              set:
                player.address === game.winner
                  ? (((
                      await prisma.playerStats.findUnique({
                        where: { playerId: player.id },
                      })
                    )?.wins || 0 + 1) /
                      ((
                        await prisma.playerStats.findUnique({
                          where: { playerId: player.id },
                        })
                      )?.totalGames || 0 + 1)) *
                    100
                  : (
                      await prisma.playerStats.findUnique({
                        where: { playerId: player.id },
                      })
                    )?.wins ||
                    (0 /
                      ((
                        await prisma.playerStats.findUnique({
                          where: { playerId: player.id },
                        })
                      )?.totalGames || 0 + 1)) *
                      100,
            },
          },
          create: {
            playerId: player.id,
            totalGames: 1,
            wins: player.address === game.winner ? 1 : 0,
            lastWinTimestamp:
              player.address === game.winner ? new Date(game.timestamp) : null,
            winRate: player.address === game.winner ? 100 : 0,
          },
        });
      })
    );

    return newGame;
  } catch (error) {
    console.error("Error adding game history:", error);
    throw error;
  }
}

export async function getTopPlayers(limit: number = 10) {
  try {
    const topPlayers = await prisma.player.findMany({
      include: {
        stats: true,
      },
      orderBy: {
        stats: {
          wins: "desc",
        },
      },
      take: limit,
    });

    return topPlayers.map((player) => ({
      address: player.address as `0x${string}`,
      wins: player.stats?.wins || 0,
      totalGames: player.stats?.totalGames || 0,
      lastWinTimestamp: player.stats?.lastWinTimestamp?.getTime() || 0,
      winRate: player.stats?.winRate || 0,
    }));
  } catch (error) {
    console.error("Error getting top players:", error);
    throw error;
  }
}

export async function getGameHistory() {
  try {
    const games = await prisma.game.findMany({
      include: {
        players: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return games.map((game) => ({
      gameAddress: game.gameAddress as `0x${string}`,
      winner: game.winner as `0x${string}`,
      timestamp: game.timestamp.getTime(),
      totalRounds: game.totalRounds,
      players: game.players.map((p) => p.address as `0x${string}`),
    }));
  } catch (error) {
    console.error("Error getting game history:", error);
    throw error;
  }
}
