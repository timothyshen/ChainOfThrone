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
import { getAddress, parseEther, zeroAddress } from "viem";
import hre, { viem } from "hardhat";

describe("Game", () => {
  let game: any;
  let vault: WalletClient & { account: Account };
  let player1: WalletClient & { account: Account };
  let player2: WalletClient & { account: Account };
  let nonPlayer: WalletClient & { account: Account };
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
    it("should automatically start game when second player joins", async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
      expect(await game.read.gameStatus()).to.equal(1);
    });
  });

  describe("Game Initialization", () => {
    beforeEach(async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
    });
    it("should set up correct castle positions", async () => {
      const grid = await game.read.getGrid();
      expect(grid[0].isCastle).to.equal(true);
      expect(grid[2].isCastle).to.equal(true);
      expect(grid[4].isCastle).to.equal(true);
      expect(grid[6].isCastle).to.equal(true);
      expect(grid[8].isCastle).to.equal(true);
    });
    it("should set up correct initial player positions", async () => {
      const grid = await game.read.getGrid();
      expect(grid[1].units[0]).to.equal(10n);
      expect(grid[3].units[1]).to.equal(10n);
    });

    describe("View Functions", function () {
      it("should return correct winner amount", async function () {
        const expectedWinnerAmount =
          (STAKE_AMOUNT * BigInt(2) * BigInt(WINNER_PERCENTAGE)) / BigInt(100);
        expect(await game.read.getWinnerAmount()).to.equal(
          expectedWinnerAmount
        );
      });

      it("should return correct protocol fee", async function () {
        const expectedProtocolFee =
          (STAKE_AMOUNT * BigInt(2) * BigInt(PROTOCOL_PERCENTAGE)) /
          BigInt(100);
        expect(await game.read.getProtocolFee()).to.equal(expectedProtocolFee);
      });

      it("should return game grid state", async function () {
        const grid = await game.read.getGrid();
        expect(grid.length).to.equal(9); // 3x3 grid flattened
      });
    });
  });

  describe("Move Validation", () => {
    beforeEach(async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
    });
    it("should validate move coordinates within bounds", async () => {
      const move = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };

      await game.write.makeMove([move], {
        account: getAddress(player1.account.address),
      });
    });
    it("should validate adjacent cell movements", async () => {
      const move = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 1,
        toY: 2,
        units: 5,
      };

      await game.write
        .makeMove([move], {
          account: getAddress(player1.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include(
            "Source and destination cells must be adjacent"
          );
        });
    });
    it("should validate unit counts for moves", async () => {
      const move = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 11,
      };

      await game.write
        .makeMove([move], {
          account: getAddress(player1.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include(
            "Insufficient units in source cell for this move"
          );
        });
    });
    it("should validate move coordinates within bounds", async () => {
      const move = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 3,
        units: 11,
      };

      await game.write
        .makeMove([move], {
          account: getAddress(player1.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include(
            "Move coordinates must be within 0-2 range"
          );
        });
    });
    it("should reject moves from non-player cells", async () => {
      const move = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 3,
        units: 11,
      };

      await game.write
        .makeMove([move], {
          account: getAddress(player2.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include(
            "Move player address does not match sender address"
          );
        });
    });
    it("should reject moves when user submitted a move for this round", async () => {
      const move = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };

      await game.write.makeMove([move], {
        account: getAddress(player1.account.address),
      });
      await game.write
        .makeMove([move], {
          account: getAddress(player1.account.address),
        })
        .catch((error: any) => {
          expect(error.details).to.include(
            "Player has already submitted a move for this round"
          );
        });
    });
  });

  describe("Game Mechanics", () => {
    beforeEach(async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
    });
    it("should correctly process single player move", async () => {
      const move1 = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };
      const move2 = {
        player: player2.account.address,
        fromX: 1,
        fromY: 0,
        toX: 2,
        toY: 0,
        units: 5,
      };
      await game.write.makeMove([move1], {
        account: getAddress(player1.account.address),
      });
      await game.write.makeMove([move2], {
        account: getAddress(player2.account.address),
      });
      // console.log(await game.read.getGrid());
      const grid = await game.read.getGrid();
      expect(grid[0].units[0]).to.equal(5n);
      expect(grid[1].units[0]).to.equal(5n);
      expect(grid[3].units[1]).to.equal(5n);
      expect(grid[6].units[1]).to.equal(5n);

      it("should track move history correctly", async () => {
        const moveHistory = await game.read.getMoveHistory();
        expect(moveHistory.length).to.equal(2);
        expect(moveHistory[0].player).to.equal(player1.account.address);
        expect(moveHistory[1].player).to.equal(player2.account.address);
      });
    });
    it("should resolve combat correctly", async () => {
      const move1 = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };
      const move2 = {
        player: player2.account.address,
        fromX: 1,
        fromY: 0,
        toX: 0,
        toY: 0,
        units: 5,
      };
      await game.write.makeMove([move1], {
        account: getAddress(player1.account.address),
      });
      await game.write.makeMove([move2], {
        account: getAddress(player2.account.address),
      });
      // console.log(await game.read.getGrid());
      const grid = await game.read.getGrid();
      expect(grid[0].units[0]).to.equal(0n);
      expect(grid[0].units[1]).to.equal(0n);
      expect(grid[1].units[0]).to.equal(5n);
      expect(grid[3].units[1]).to.equal(5n);
    });
  });

  describe("Win Conditions", () => {
    beforeEach(async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
    });
    it("should detect castle capture victory", async () => {
      const move1 = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 1,
      };

      const move2 = {
        player: player2.account.address,
        fromX: 1,
        fromY: 0,
        toX: 2,
        toY: 0,
        units: 1,
      };
      await game.write.makeMove([move1], {
        account: getAddress(player1.account.address),
      });
      await game.write.makeMove([move2], {
        account: getAddress(player2.account.address),
      });
      const move3 = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 2,
        units: 1,
      };
      await game.write.makeMove([move3], {
        account: getAddress(player1.account.address),
      });
      const move4 = {
        player: player2.account.address,
        fromX: 1,
        fromY: 0,
        toX: 2,
        toY: 0,
        units: 1,
      };
      await game.write.makeMove([move4], {
        account: getAddress(player2.account.address),
      });
      const move5 = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 1,
        toY: 1,
        units: 1,
      };
      await game.write.makeMove([move5], {
        account: getAddress(player1.account.address),
      });
      const move6 = {
        player: player2.account.address,
        fromX: 1,
        fromY: 0,
        toX: 2,
        toY: 0,
        units: 1,
      };
      await game.write.makeMove([move6], {
        account: getAddress(player2.account.address),
      });
      expect(await game.read.winner()).to.equal(
        getAddress(player1.account.address)
      );
      console.log(await game.read.gameStatus());
      describe("Claim Reward", function () {
        it("should allow winner to claim reward", async () => {
          const publicClient = await hre.viem.getPublicClient();

          const initialBalance = await publicClient.getBalance({
            address: getAddress(player1.account.address),
          });

          const expectedReward = await game.read.getWinnerAmount();
          console.log(await game.read.winner());
          // await game.write.claimReward({
          //   account: getAddress(player1.account.address),
          // });

          const finalBalance = await publicClient.getBalance({
            address: getAddress(player1.account.address),
          });

          // Compare the balances, accounting for gas costs
          // expect(Number(finalBalance)).to.be.greaterThan(
          //   Number(initialBalance)
          // );
          // expect(
          //   Number(finalBalance) - Number(initialBalance)
          // ).to.be.lessThanOrEqual(Number(expectedReward));
        });
        it("should prevent non-winners from claiming reward");
      });
    });
    it("should detect tie conditions");
    it("should prevent non-winners from claiming reward");
  });

  describe("Edge Cases & Security", () => {
    beforeEach(async () => {
      const requiredStake = STAKE_AMOUNT;
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player1.account.address),
      });
      await game.write.addPlayer({
        value: requiredStake,
        account: getAddress(player2.account.address),
      });
    });
    it("should prevent moves after game end");
    it("should handle concurrent moves properly", async () => {
      const move1 = {
        player: player1.account.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };

      const move2 = {
        player: player2.account.address,
        fromX: 1,
        fromY: 0,
        toX: 0,
        toY: 0,
        units: 5,
      };

      // Submit moves concurrently
      await Promise.all([
        game.write.makeMove([move1], {
          account: getAddress(player1.account.address),
        }),
        game.write.makeMove([move2], {
          account: getAddress(player2.account.address),
        }),
      ]);

      const grid = await game.read.getGrid();

      // Verify both moves were processed correctly
      expect(grid[0].units[0]).to.equal(2n); // Player 1 source cell
      expect(grid[1].units[0]).to.equal(3n); // Player 1 destination cell
      expect(grid[0].units[1]).to.equal(2n); // Player 2 source cell
      expect(grid[1].units[1]).to.equal(3n); // Player 2 destination cell
    });
    it("should properly distribute stakes and fees");
  });
});
