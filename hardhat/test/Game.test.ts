import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import {
  createPublicClient,
  http,
  createWalletClient,
  WalletClient,
  PublicClient,
  Account,
} from "viem";
import { getAddress, parseGwei, parseEther, zeroAddress } from "viem";
import hre, { viem } from "hardhat";

describe("Game", () => {
  let game: any;
  let vault: WalletClient;
  let player1: WalletClient;
  let player2: WalletClient;
  let nonPlayer: WalletClient;
  const STAKE_AMOUNT = parseEther("1"); // 1 monad
  const WINNER_PERCENTAGE = 90;
  const PROTOCOL_PERCENTAGE = 10;

  beforeEach(async () => {
    const [deployer, ...accounts] = await hre.viem.getWalletClients();
    [vault, player1, player2, nonPlayer] = accounts;
    game = await hre.viem.deployContract("Game", [
      (vault as WalletClient & { account: Account }).account.address,
    ]);
  });
  // Test suites
  describe("Deployment & Initial State", () => {
    it("should deploy with correct initial state", async () => {
      expect(await game.read.vault()).to.equal(
        getAddress(vault.account.address)
      );
    });
    it("should set correct vault address", async () => {
      expect(await game.read.vault()).to.equal(
        getAddress(vault.account.address)
      );
    });
    it("should initialize with correct state variables", async () => {
      expect(getAddress(await game.read.vault())).to.equal(
        getAddress(vault.account.address)
      );
      expect(await game.read.gameStatus()).to.equal(0);
      expect(await game.read.totalPlayers()).to.equal(0);
      expect(await game.read.roundNumber()).to.equal(0n);
      expect(await game.read.winner()).to.equal(zeroAddress);
    });
  });

  describe("Player Registration", () => {
    it("should allow first player to join with correct stake", async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      expect(await game.read.totalPlayers()).to.equal(1);
      expect(await game.read.idToAddress([0])).to.equal(
        getAddress(player1.account.address)
      );
    });
    it("should allow second player to join with correct stake", async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
      expect(await game.read.totalPlayers()).to.equal(2);
      expect(await game.read.idToAddress([1])).to.equal(
        getAddress(player2.account.address)
      );
    });
    it("should reject registration with incorrect stake amount", async () => {
      const requiredStake = parseEther("0.9");
      await game.write
        .addPlayer({
          value: requiredStake,
          account: getAddress(player2.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include("Must stake 1 mon");
        });
    });
    it("should reject duplicate player registration", async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write
        .addPlayer({
          value: requiredStake,
          account: getAddress(player1.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include(
            "Address is already registered as a player in this game"
          );
        });
    });
    it("should automatically start game when second player joins");
  });

  describe("Game Initialization", () => {
    it("should set up correct castle positions");
    it("should set up correct initial player positions");
    it("should set up correct initial unit counts");
    it("should emit GameStarted event");
  });

  describe("Move Validation", () => {
    it("should validate move coordinates within bounds");
    it("should validate adjacent cell movements");
    it("should validate unit counts for moves");
    it("should reject moves from non-player cells");
    it("should reject moves when game not in progress");
  });

  describe("Game Mechanics", () => {
    it("should correctly process single player move");
    it("should correctly process both players moves in one round");
    it("should resolve combat correctly");
    it("should handle unit calculations properly");
    it("should track move history correctly");
  });

  describe("Win Conditions", () => {
    it("should detect castle capture victory");
    it("should detect tie conditions");
    it("should allow winner to claim reward");
    it("should prevent non-winners from claiming reward");
  });

  describe("Edge Cases & Security", () => {
    it("should handle zero unit moves");
    it("should prevent moves after game end");
    it("should handle concurrent moves properly");
    it("should properly distribute stakes and fees");
  });
});
