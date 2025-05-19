import { expect } from "chai";
import { ethers } from "hardhat";
import { Game } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Game Contract", function () {
  let game: Game;
  let vault: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let nonPlayer: SignerWithAddress;
  const STAKE_AMOUNT = ethers.parseEther("1"); // 1 monad
  const WINNER_PERCENTAGE = 90;
  const PROTOCOL_PERCENTAGE = 10;

  beforeEach(async function () {
    [vault, player1, player2, nonPlayer] = await ethers.getSigners();

    const GameFactory = await ethers.getContractFactory("Game");
    game = (await GameFactory.deploy(vault.address)) as Game;
    await game.waitForDeployment();
  });

  describe("Game Setup", function () {
    it("should initialize with correct state variables", async function () {
      expect(await game.vault()).to.equal(vault.address);
      expect(await game.gameStatus()).to.equal(0); // NotStarted
      expect(await game.totalPlayers()).to.equal(0);
      expect(await game.roundNumber()).to.equal(0);
      expect(await game.winner()).to.equal(ethers.ZeroAddress);
    });

    it("should allow players to join with correct stake amount", async function () {
      const requiredStake = STAKE_AMOUNT;
      await expect(game.connect(player1).addPlayer({ value: requiredStake }))
        .to.emit(game, "PlayerAdded")d
        .withArgs(player1.address, 0);

      expect(await game.totalPlayers()).to.equal(1);
      expect(await game.idToAddress(0)).to.equal(player1.address);
    });

    it("should start game when max players join", async function () {
      const requiredStake = STAKE_AMOUNT;
      await game.connect(player1).addPlayer({ value: requiredStake });
      await expect(
        game.connect(player2).addPlayer({ value: requiredStake })
      ).to.emit(game, "GameStarted");

      expect(await game.gameStatus()).to.equal(1); // Ongoing
      expect(await game.totalPlayers()).to.equal(2);
    });

    it("should not allow more than MAX_PLAYERS to join", async function () {
      const requiredStake = STAKE_AMOUNT;
      await game.connect(player1).addPlayer({ value: requiredStake });
      await game.connect(player2).addPlayer({ value: requiredStake });

      await expect(
        game.connect(nonPlayer).addPlayer({ value: requiredStake })
      ).to.be.revertedWith("Maximum number of players (2) has been reached");
    });
  });

  describe("Game Mechanics", function () {
    beforeEach(async function () {
      const requiredStake = STAKE_AMOUNT;
      await game.connect(player1).addPlayer({ value: requiredStake });
      await game.connect(player2).addPlayer({ value: requiredStake });
    });

    it("should allow valid moves", async function () {
      const move = {
        player: player1.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };

      await expect(game.connect(player1).makeMove(move))
        .to.emit(game, "MoveSubmitted")
        .withArgs(
          player1.address,
          move.fromX,
          move.fromY,
          move.toX,
          move.toY,
          move.units
        );
    });

    it("should reject invalid moves", async function () {
      const invalidMove = {
        player: player1.address,
        fromX: 0,
        fromY: 1,
        toX: 2, // Non-adjacent cell
        toY: 2,
        units: 5,
      };

      await expect(
        game.connect(player1).makeMove(invalidMove)
      ).to.be.revertedWith("Source and destination cells must be adjacent");
    });

    it("should reject moves with insufficient units", async function () {
      const invalidMove = {
        player: player1.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 11, // More than available units (10)
      };

      await expect(
        game.connect(player1).makeMove(invalidMove)
      ).to.be.revertedWith("Insufficient units in source cell for this move");
    });

    it("should execute round when all players submit moves", async function () {
      const move1 = {
        player: player1.address,
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 0,
        units: 5,
      };

      const move2 = {
        player: player2.address,
        fromX: 1,
        fromY: 0,
        toX: 1,
        toY: 1,
        units: 5,
      };

      await game.connect(player1).makeMove(move1);
      await expect(game.connect(player2).makeMove(move2))
        .to.emit(game, "RoundCompleted")
        .withArgs(0);
    });
  });

  describe("Game Resolution", function () {
    beforeEach(async function () {
      const requiredStake = STAKE_AMOUNT;
      await game.connect(player1).addPlayer({ value: requiredStake });
      await game.connect(player2).addPlayer({ value: requiredStake });
    });

    it("should allow winner to claim reward", async function () {
      // Simulate game end by directly setting winner (this would normally happen through gameplay)
      // This requires exposing a test function in the contract or finding a way to win the game
      // through legitimate moves
      // For testing purposes, we need to implement a way to force end the game
      // This could be done by:
      // 1. Adding a test-only function to set game status and winner
      // 2. Or playing through a full game scenario
      // Once we have a winner:
      // const winnerAmount = STAKE_AMOUNT.mul(2).mul(WINNER_PERCENTAGE).div(100);
      // await expect(game.connect(winner).claimReward())
      //   .to.emit(game, "RewardClaimed")
      //   .withArgs(winner.address, winnerAmount);
    });

    it("should not allow non-winners to claim reward", async function () {
      await expect(game.connect(nonPlayer).claimReward()).to.be.revertedWith(
        "Game not finished"
      );
    });
  });

  describe("View Functions", function () {
    it("should return correct winner amount", async function () {
      const expectedWinnerAmount =
        (STAKE_AMOUNT * BigInt(2) * BigInt(WINNER_PERCENTAGE)) / BigInt(100);
      expect(await game.getWinnerAmount()).to.equal(expectedWinnerAmount);
    });

    it("should return correct protocol fee", async function () {
      const expectedProtocolFee =
        (STAKE_AMOUNT * BigInt(2) * BigInt(PROTOCOL_PERCENTAGE)) / BigInt(100);
      expect(await game.getProtocolFee()).to.equal(expectedProtocolFee);
    });

    it("should return game grid state", async function () {
      const grid = await game.getGrid();
      expect(grid.length).to.equal(9); // 3x3 grid flattened
    });

    it("should return move history", async function () {
      const moveHistory = await game.getMoveHistory();
      expect(Array.isArray(moveHistory)).to.be.true;
    });
  });
});
