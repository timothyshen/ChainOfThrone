// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IGame {
    struct Cell {
        address player;
        bool isCastle;
        uint256[2] units;
    }

    struct Move {
        address player;
        uint8 fromX;
        uint8 fromY;
        uint8 toX;
        uint8 toY;
        uint256 units;
    }

    struct MoveHistory {
        address player;
        uint8 fromX;
        uint8 fromY;
        uint8 toX;
        uint8 toY;
        uint256 units;
        uint256 timestamp;
        uint256 roundNumber;
    }

    enum GameStatus {
        NotStarted,
        Ongoing,
        Finished
    }

    event GameStarted();
    event GameFinalized(address indexed winner);
    event PlayerAdded(address indexed player, uint8 playerId);
    event MoveSubmitted(
        address indexed player,
        uint8 fromX,
        uint8 fromY,
        uint8 toX,
        uint8 toY,
        uint256 units
    );
    event RoundCompleted(uint256 indexed roundNumber);
    event MoveRecorded(
        address indexed player,
        uint8 fromX,
        uint8 fromY,
        uint8 toX,
        uint8 toY,
        uint256 units,
        uint256 roundNumber
    );
    event RewardClaimed(address indexed player, uint256 amount);

    function MAX_PLAYERS() external pure returns (uint8);

    function STAKE_AMOUNT() external pure returns (uint256);

    function WINNER_PERCENTAGE() external pure returns (uint256);

    function PROTOCOL_PERCENTAGE() external pure returns (uint256);

    function vault() external view returns (address);

    function totalPlayers() external view returns (uint8);

    function gameStatus() external view returns (GameStatus);

    function roundNumber() external view returns (uint256);

    function winner() external view returns (address);

    function grid(uint8 x, uint8 y) external view returns (Cell memory);

    function idToAddress(uint8 id) external view returns (address);

    function addressToId(address player) external view returns (uint8);

    function addPlayer() external payable;

    function makeMove(Move memory _move) external;

    function claimReward() external;

    function getWinnerAmount() external pure returns (uint256);

    function getProtocolFee() external pure returns (uint256);

    function getGrid() external view returns (Cell[9] memory cells);

    function get2dGrid() external view returns (Cell[3][3] memory cells);

    function getWinner() external view returns (address);

    function getMoveHistory() external view returns (MoveHistory[] memory);

    function getPlayerMoves(
        address player
    ) external view returns (MoveHistory[] memory);

    function getRoundMoves(
        uint256 round
    ) external view returns (MoveHistory[] memory);
}
