// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "src/Game.sol";

contract GameTest is Test {
    Game private game;
    address private player1 = address(1);
    address private player2 = address(2);

    function setUp() public {
        game = new Game();
    }

    function testAddPlayer() public {
        assertEq(uint(game.gameStatus()), uint(Game.GameStatus.NotStarted));
        // Player 1 joins
        vm.prank(player1);
        game.addPlayer();
        assertEq(game.totalPlayers(), 1);
        assertEq(game.idToAddress(0), player1);
        assertEq(game.addressToId(player1), 0);

        // Player 2 joins
        vm.prank(player2);
        game.addPlayer();
        assertEq(game.totalPlayers(), 2);
        assertEq(game.idToAddress(1), player2);
        assertEq(game.addressToId(player2), 1);

        // Ensure game starts
        assertEq(uint(game.gameStatus()), uint(Game.GameStatus.Ongoing));
    }

    function testAddPlayerFailsIfMaxPlayersReached() public {
        vm.prank(player1);
        game.addPlayer();

        vm.prank(player2);
        game.addPlayer();

        address player3 = address(3);
        vm.prank(player3);
        vm.expectRevert("Game already started");
        game.addPlayer();
    }

    function testMakeValidMove() public {
        // Setup: Add players and start the game
        vm.prank(player1);
        game.addPlayer();
        vm.prank(player2);
        game.addPlayer();

        // Player 1 makes a valid move
        Game.Move memory move = Game.Move({
            player: player1,
            fromX: 0,
            fromY: 1,
            toX: 1,
            toY: 1,
            units: 5
        });

        vm.prank(player1);
        game.makeMove(move);

        // Verify move submission
        (
            address player,
            uint8 fromX,
            uint8 fromY,
            uint8 toX,
            uint8 toY,
            uint256 units
        ) = game.pendingMoves(0);
        assertEq(move.player, player);
        assertEq(move.fromX, fromX);
        assertEq(move.fromY, fromY);
        assertEq(move.toX, toX);
        assertEq(move.toY, toY);
        assertEq(move.units, units);
        assertTrue(game.roundSubmitted(0));
    }

    function testInvalidMoveFails() public {
        // Setup: Add players and start the game
        vm.prank(player1);
        game.addPlayer();
        vm.prank(player2);
        game.addPlayer();

        // Player 1 tries an invalid move
        Game.Move memory invalidMove = Game.Move({
            player: player1,
            fromX: 0,
            fromY: 1,
            toX: 2,
            toY: 2,
            units: 5
        });

        vm.prank(player1);
        vm.expectRevert("Invalid move");
        game.makeMove(invalidMove);
    }

    function testFullGame() public {
        // Setup: Add players and start the game
        vm.prank(player1);
        game.addPlayer();
        vm.prank(player2);
        game.addPlayer();

        // Player 1 makes a valid move
        Game.Move memory move1 = Game.Move({
            player: player1,
            fromX: 0,
            fromY: 1,
            toX: 1,
            toY: 1,
            units: 4
        });

        vm.prank(player1);
        game.makeMove(move1);

        // Player 2 makes a valid move
        Game.Move memory move2 = Game.Move({
            player: player2,
            fromX: 1,
            fromY: 0,
            toX: 1,
            toY: 1,
            units: 6
        });

        vm.prank(player2);
        game.makeMove(move2);

        // Verify round execution and unit updates
        Game.Cell[3][3] memory grid = game.get2dGrid();
        assertEq(grid[1][1].units[1], 2);
        assertEq(grid[1][1].player, player2);

        assertEq(grid[0][1].units[0], 6);
        assertEq(grid[1][0].units[1], 4);
        assertEq(uint(game.gameStatus()), uint(Game.GameStatus.Ongoing));

        // Player 1 makes a valid move
        move1 = Game.Move({
            player: player1,
            fromX: 0,
            fromY: 1,
            toX: 0,
            toY: 2,
            units: 1
        });

        vm.prank(player1);
        game.makeMove(move1);

        // Player 2 makes a valid move
        move2 = Game.Move({
            player: player2,
            fromX: 1,
            fromY: 0,
            toX: 0,
            toY: 0,
            units: 1
        });

        vm.prank(player2);
        game.makeMove(move2);

        // Verify round execution and unit updates
        grid = game.get2dGrid();
        assertEq(grid[1][1].units[1], 2);
        assertEq(grid[0][1].units[0], 5);
        assertEq(grid[1][0].units[1], 3);
        assertEq(grid[0][0].units[1], 1);
        assertEq(grid[0][2].units[0], 1);
        assertEq(uint(game.gameStatus()), uint(Game.GameStatus.Ongoing));

        // Player 1 makes a valid move
        move1 = Game.Move({
            player: player1,
            fromX: 0,
            fromY: 1,
            toX: 0,
            toY: 2,
            units: 4
        });

        vm.prank(player1);
        game.makeMove(move1);

        // Player 2 makes a valid move
        move2 = Game.Move({
            player: player2,
            fromX: 1,
            fromY: 0,
            toX: 2,
            toY: 0,
            units: 2
        });

        vm.prank(player2);
        game.makeMove(move2);

        // Verify round execution and unit updates
        grid = game.get2dGrid();
        assertEq(grid[1][1].units[1], 2);
        assertEq(grid[0][1].units[0], 1);
        assertEq(grid[1][0].units[1], 1);
        assertEq(grid[0][0].units[1], 1);
        assertEq(grid[0][2].units[0], 5);
        assertEq(grid[2][0].units[1], 2);
        assertEq(uint(game.gameStatus()), uint(Game.GameStatus.Finished));
        assertEq(game.winner(), player2);
    }

    function testTie() public {
        // Setup: Add players and start the game
        vm.prank(player1);
        game.addPlayer();
        vm.prank(player2);
        game.addPlayer();

        // Player 1 makes a valid move
        Game.Move memory move1 = Game.Move({
            player: player1,
            fromX: 0,
            fromY: 1,
            toX: 1,
            toY: 1,
            units: 10
        });

        vm.prank(player1);
        game.makeMove(move1);

        // Player 2 makes a valid move
        Game.Move memory move2 = Game.Move({
            player: player2,
            fromX: 1,
            fromY: 0,
            toX: 1,
            toY: 1,
            units: 10
        });

        vm.prank(player2);
        game.makeMove(move2);

        // Verify round execution and unit updates
        Game.Cell[3][3] memory grid = game.get2dGrid();
        assertEq(grid[1][1].player, address(0));
        assertEq(uint(game.gameStatus()), uint(Game.GameStatus.Finished));
        assertEq(game.winner(), address(0));
    }
}
