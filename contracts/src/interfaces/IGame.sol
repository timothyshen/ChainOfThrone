// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IGame {
    struct Cell {
        Move[] pendingMoves;
        Loan[] pendingLoans;
        address player;
        uint256 units;
        bool isCastle;
    }

    struct Move {
        address player;
        uint8 fromX;
        uint8 fromY;
        uint8 toX;
        uint8 toY;
        uint256 units;
    }

    struct Loan {
        address lender;
        address borrower;
        uint8 fromX;
        uint8 fromY;
        uint8 toX;
        uint8 toY;
        uint256 units;
    }

    enum GameStatus {
        NotStarted,
        Ongoing,
        Finished
    }

    event GameStarted();
    event GameFinalized(address indexed winner);
    event PlayerAdded(address indexed player, uint8 playerId);

    function MAX_PLAYERS() external pure returns (uint8);

    function totalPlayers() external view returns (uint8);

    function gameStatus() external view returns (GameStatus);

    function roundNumber() external view returns (uint256);

    function grid(uint8 x, uint8 y) external view returns (Cell memory);

    function idToAddress(uint8 id) external view returns (address);

    function addressToId(address player) external view returns (uint8);

    function addPlayer() external;

    function makeMove(Move memory _move) external;

    function makeLoan(Loan memory _loan) external;

    function executeRound() external;

    function getGrid() external view returns (Cell[9] memory cells);

    function get2dGrid() external view returns (Cell[3][3] memory cells);

    function checkValidMove(Move memory _move) external view returns (bool);

    function checkValidLoan(Loan memory _loan) external view returns (bool);
}

