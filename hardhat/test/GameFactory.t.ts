import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";

describe("GameFactory", () => {
  // Deploy fixture
  async function deployGameFactoryFixture() {
    const gameFactory = await hre.viem.deployContract("GameFactory");
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    return { gameFactory, owner, otherAccount };
  }

  describe("Game Creation", () => {
    it("should create a game", async () => {
      const { gameFactory, owner } = await loadFixture(
        deployGameFactoryFixture
      );

      // Create a game
      const tx = await gameFactory.write.createGame();
      console.log(tx);
      // Verify game was created
      expect(await gameFactory.read.getGamesCount()).equal(1n);

      // Check event was emitted
      const events = await gameFactory.getEvents.GameCreated();
      expect(events.length).equal(1);
      // @ts-ignore
      expect(events[0].args.creator?.toLowerCase()).equal(
        owner.account.address.toLowerCase()
      );
    });

    it("should track games by creator", async () => {
      const { gameFactory, owner } = await loadFixture(
        deployGameFactoryFixture
      );

      // Create multiple games
      await gameFactory.write.createGame();
      await gameFactory.write.createGame();

      const creatorGames = await gameFactory.read.getGamesByCreator([
        owner.account.address,
      ]);
      console.log(creatorGames);
      // @ts-ignore
      expect(creatorGames.length).equal(2);
    });
  });

  describe("Game Info", () => {
    it("should return game info", async () => {
      const { gameFactory } = await loadFixture(deployGameFactoryFixture);

      // Create a game
      await gameFactory.write.createGame();

      // Get game info
      const gameInfos = await gameFactory.read.getGamesInfo([0n, 1n]);
      // @ts-ignore
      expect(gameInfos.length).equal(1);

      const gameInfo = gameInfos[0];
      // @ts-ignore
      expect(gameInfo.status).equal(0); // Initial status
      // @ts-ignore
      expect(gameInfo.totalPlayers).equal(0);
      // @ts-ignore
      expect(gameInfo.maxPlayers).equal(2);
    });

    it("should handle pagination in getGamesInfo", async () => {
      const { gameFactory } = await loadFixture(deployGameFactoryFixture);

      // Create multiple games
      await gameFactory.write.createGame();
      await gameFactory.write.createGame();
      await gameFactory.write.createGame();

      // Get paginated results
      const gameInfos = await gameFactory.read.getGamesInfo([1n, 2n]);
      // @ts-ignore
      expect(gameInfos.length).equal(2);
    });
  });

  describe("Game Validation", () => {
    it("should correctly track if address is a game", async () => {
      const { gameFactory } = await loadFixture(deployGameFactoryFixture);

      const tx = await gameFactory.write.createGame();

      // Get game address from event
      const events = await gameFactory.getEvents.GameCreated();
      const gameAddress = events[0].args.gameAddress;

      // Verify isGame mapping
      expect(await gameFactory.read.isGame([gameAddress])).equal(true);
      expect(
        await gameFactory.read.isGame([
          "0x1234567890123456789012345678901234567890",
        ])
      ).equal(false);
    });
  });

  describe("Game Lists", () => {
    it("should return all games", async () => {
      const { gameFactory } = await loadFixture(deployGameFactoryFixture);

      // Create multiple games
      await gameFactory.write.createGame();
      await gameFactory.write.createGame();

      const allGames = await gameFactory.read.getGames();
      // @ts-ignore
      expect(allGames.length).equal(2);
    });

    it("should return correct games count", async () => {
      const { gameFactory } = await loadFixture(deployGameFactoryFixture);

      await gameFactory.write.createGame();
      // @ts-ignore
      expect(await gameFactory.read.getGamesCount()).equal(1n);

      await gameFactory.write.createGame();
      // @ts-ignore
      expect(await gameFactory.read.getGamesCount()).equal(2n);
    });
  });
});
