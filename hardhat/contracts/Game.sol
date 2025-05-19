// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Game - A blockchain-based strategy game
/// @notice This contract implements a 2-player strategy game on a 3x3 grid
/// @dev Players can move units between cells and capture castles to win
contract Game {
    // --- Constants ---
    uint8 public constant MAX_PLAYERS = 2;
    address public vault;
    uint256 public constant STAKE_AMOUNT = 1e18; // 1 monad
    uint256 public constant WINNER_PERCENTAGE = 90; // 90% of total stakes
    uint256 public constant PROTOCOL_PERCENTAGE = 10; // 10% of total stakes

    // --- State Variables ---
    GameStatus public gameStatus;
    uint8 public totalPlayers;
    uint256 public roundNumber;
    address public winner;
    Cell[3][3] public grid;
    bool[MAX_PLAYERS] public roundSubmitted;
    Move[MAX_PLAYERS] public pendingMoves;
    MoveHistory[] public moveHistory;

    // --- Mappings ---
    mapping(uint8 => address) public idToAddress;
    mapping(address => uint8) public addressToId;

    // --- Structs ---
    struct Cell {
        address player;
        bool isCastle;
        uint256[MAX_PLAYERS] units;
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

    // --- Enums ---
    enum GameStatus {
        NotStarted,
        Ongoing,
        Finished
    }

    // --- Events ---
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

    // --- Constructor ---
    constructor(address _vault) {
        vault = _vault;
    }

    // --- Modifiers ---
    modifier onlyNotStarted() {
        require(
            gameStatus == GameStatus.NotStarted,
            "Game has already started or finished"
        );
        _;
    }

    modifier onlyOngoing() {
        require(
            gameStatus == GameStatus.Ongoing,
            "Game must be in ongoing state - current state: not started or finished"
        );
        _;
    }

    modifier onlyPlayer() {
        require(
            addressToId[msg.sender] < totalPlayers,
            "Caller is not a registered player in this game"
        );
        _;
    }

    // --- External/Public Functions ---
    function addPlayer() external payable onlyNotStarted {
        uint256 protocolFee = (STAKE_AMOUNT * PROTOCOL_PERCENTAGE) / 100;
        uint256 gameDeposit = (STAKE_AMOUNT * WINNER_PERCENTAGE) / 100;
        require(
            totalPlayers < MAX_PLAYERS,
            "Maximum number of players (2) has been reached"
        );
        require(
            addressToId[msg.sender] == 0 &&
                (totalPlayers == 0 || idToAddress[0] != msg.sender),
            "Address is already registered as a player in this game"
        );
        //@todo: need to come back during v2
        // require(msg.value == protocolFee + gameDeposit, "Must stake 1 mon");

        // (bool success, ) = vault.call{value: protocolFee}("");
        // require(success, "Failed to send protocol fee");

        uint8 playerId = totalPlayers;
        idToAddress[playerId] = msg.sender;
        addressToId[msg.sender] = playerId;

        emit PlayerAdded(msg.sender, playerId);
        totalPlayers++;

        if (totalPlayers == MAX_PLAYERS) {
            _startGame();
        }
    }

    function makeMove(Move memory _move) public onlyOngoing {
        require(
            !roundSubmitted[addressToId[msg.sender]],
            "Player has already submitted a move for this round"
        );
        require(
            _move.player == msg.sender,
            "Move player address does not match sender address"
        );
        require(
            _checkValidMove(_move),
            "Invalid move: out of bounds, not adjacent, or insufficient units"
        );

        Cell storage fromCell = grid[_move.fromX][_move.fromY];
        require(
            fromCell.player == msg.sender,
            "Player does not control the source cell"
        );

        pendingMoves[addressToId[msg.sender]] = _move;
        roundSubmitted[addressToId[msg.sender]] = true;

        _recordMove(_move);

        if (_allMovesSubmitted()) {
            executeRound();
            emit RoundCompleted(roundNumber);
        }
    }

    function executeRound() internal onlyOngoing {
        _handlePendingMoves();
        _resolveCombat();
        roundNumber++;
        delete roundSubmitted;
        _checkGameStatus();
    }

    function claimReward() external {
        // require(gameStatus == GameStatus.Finished, "Game not finished");
        require(winner != address(0), "No winner");
        require(msg.sender == winner, "Only winner can claim prize");
        uint256 winnerAmount = (STAKE_AMOUNT * WINNER_PERCENTAGE) / 100;

        (bool sentWinner, ) = msg.sender.call{value: winnerAmount}("");
        require(sentWinner, "Failed to send winner amount");

        emit RewardClaimed(msg.sender, winnerAmount);
    }

    // --- View Functions ---
    function getWinnerAmount() public pure returns (uint256) {
        return (STAKE_AMOUNT * MAX_PLAYERS * WINNER_PERCENTAGE) / 100;
    }

    function getProtocolFee() public pure returns (uint256) {
        return (STAKE_AMOUNT * MAX_PLAYERS * PROTOCOL_PERCENTAGE) / 100;
    }

    function getGrid() public view returns (Cell[9] memory cells) {
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                cells[3 * i + j] = grid[i][j];
            }
        }
    }

    function get2dGrid() public view returns (Cell[3][3] memory cells) {
        return grid;
    }

    function getWinner() public view returns (address) {
        return winner;
    }

    function getMoveHistory() external view returns (MoveHistory[] memory) {
        return moveHistory;
    }

    function getPlayerMoves(
        address player
    ) external view returns (MoveHistory[] memory) {
        uint256 playerMoveCount = 0;
        for (uint256 i = 0; i < moveHistory.length; i++) {
            if (moveHistory[i].player == player) {
                playerMoveCount++;
            }
        }

        MoveHistory[] memory playerMoves = new MoveHistory[](playerMoveCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < moveHistory.length; i++) {
            if (moveHistory[i].player == player) {
                playerMoves[currentIndex] = moveHistory[i];
                currentIndex++;
            }
        }

        return playerMoves;
    }

    function getRoundMoves(
        uint256 round
    ) external view returns (MoveHistory[] memory) {
        uint256 roundMoveCount = 0;
        for (uint256 i = 0; i < moveHistory.length; i++) {
            if (moveHistory[i].roundNumber == round) {
                roundMoveCount++;
            }
        }

        MoveHistory[] memory roundMoves = new MoveHistory[](roundMoveCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < moveHistory.length; i++) {
            if (moveHistory[i].roundNumber == round) {
                roundMoves[currentIndex] = moveHistory[i];
                currentIndex++;
            }
        }

        return roundMoves;
    }

    // --- Internal Functions ---
    function _startGame() internal onlyNotStarted {
        gameStatus = GameStatus.Ongoing;

        // Set up castles
        grid[0][0].isCastle = true;
        grid[0][2].isCastle = true;
        grid[1][1].isCastle = true;
        grid[2][0].isCastle = true;
        grid[2][2].isCastle = true;

        // Set up initial player positions
        grid[0][1].player = idToAddress[0];
        grid[0][1].units[0] = 10;

        grid[1][0].player = idToAddress[1];
        grid[1][0].units[1] = 10;

        emit GameStarted();
    }

    function _finalizeGame(address _winner) internal onlyOngoing {
        gameStatus = GameStatus.Finished;
        winner = _winner;
        emit GameFinalized(winner);
    }

    function _checkGameStatus() internal {
        uint8[] memory winnerCheck = new uint8[](totalPlayers);
        uint256[] memory totalUnits = new uint256[](totalPlayers);

        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                Cell memory cell = grid[i][j];
                if (cell.isCastle && cell.player != address(0)) {
                    winnerCheck[addressToId[cell.player]]++;
                }
                totalUnits[addressToId[cell.player]] += cell.units[
                    addressToId[cell.player]
                ];
            }
        }

        if (_checkTie(totalUnits)) {
            _finalizeGame(address(0));
            return;
        }

        for (uint8 i = 0; i < totalPlayers; i++) {
            if (winnerCheck[i] >= 3) {
                _finalizeGame(idToAddress[i]);
                break;
            }
        }
    }

    function _checkTie(
        uint256[] memory totalUnits
    ) internal view returns (bool) {
        for (uint8 i = 0; i < totalPlayers; i++) {
            if (totalUnits[i] > 2) {
                return false;
            }
        }
        return true;
    }

    function _recordMove(Move memory _move) internal {
        moveHistory.push(
            MoveHistory({
                player: msg.sender,
                fromX: _move.fromX,
                fromY: _move.fromY,
                toX: _move.toX,
                toY: _move.toY,
                units: _move.units,
                timestamp: block.timestamp,
                roundNumber: roundNumber
            })
        );

        emit MoveRecorded(
            msg.sender,
            _move.fromX,
            _move.fromY,
            _move.toX,
            _move.toY,
            _move.units,
            roundNumber
        );
    }

    function _allMovesSubmitted() internal view returns (bool) {
        for (uint8 i = 0; i < totalPlayers; i++) {
            if (!roundSubmitted[i]) {
                return false;
            }
        }
        return true;
    }

    function _handlePendingMoves() internal {
        for (uint i = 0; i < totalPlayers; i++) {
            Move memory currentMove = pendingMoves[i];
            Cell storage fromCell = grid[currentMove.fromX][currentMove.fromY];
            Cell storage toCell = grid[currentMove.toX][currentMove.toY];

            uint8 playerId = addressToId[currentMove.player];
            fromCell.units[playerId] -= currentMove.units;
            toCell.units[playerId] += currentMove.units;
        }
    }

    function _resolveCombat() internal {
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                Cell storage cell = grid[i][j];
                (
                    uint256 winnerUnits,
                    uint8 winnerId,
                    uint256 totalUnits,
                    bool tie
                ) = _determineCellWinner(cell);

                delete cell.units;
                if (tie || totalUnits == 0 || winnerId == MAX_PLAYERS) {
                    cell.player = address(0);
                } else {
                    cell.units[winnerId] = 2 * winnerUnits - totalUnits;
                    cell.player = idToAddress[winnerId];
                }
            }
        }
    }

    function _determineCellWinner(
        Cell memory _cell
    )
        internal
        view
        returns (
            uint256 winnerUnits,
            uint8 winnerId,
            uint256 totalUnits,
            bool tie
        )
    {
        winnerUnits = 0;
        totalUnits = 0;
        winnerId = MAX_PLAYERS;
        for (uint8 i = 0; i < totalPlayers; i++) {
            if (_cell.units[i] > winnerUnits) {
                winnerUnits = _cell.units[i];
                winnerId = i;
                tie = false;
            } else if (_cell.units[i] == winnerUnits) {
                tie = true;
            }
            totalUnits += _cell.units[i];
        }
    }

    function _checkValidMove(Move memory _move) internal view returns (bool) {
        if (
            _move.fromX >= 3 ||
            _move.fromY >= 3 ||
            _move.toX >= 3 ||
            _move.toY >= 3
        ) {
            revert("Move coordinates must be within 0-2 range");
        }

        if (!_isAdjacent(_move.fromX, _move.fromY, _move.toX, _move.toY)) {
            revert("Source and destination cells must be adjacent");
        }

        Cell storage fromCell = grid[_move.fromX][_move.fromY];
        if (fromCell.units[addressToId[_move.player]] < _move.units) {
            revert("Insufficient units in source cell for this move");
        }

        if (_move.units == 0) {
            revert("Must move at least 1 unit");
        }

        return true;
    }

    function _isAdjacent(
        uint8 x1,
        uint8 y1,
        uint8 x2,
        uint8 y2
    ) internal pure returns (bool) {
        uint8 dx = x1 > x2 ? x1 - x2 : x2 - x1;
        uint8 dy = y1 > y2 ? y1 - y2 : y2 - y1;
        return (dx + dy) == 1;
    }
}
