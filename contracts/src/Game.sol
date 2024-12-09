// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Game {
    uint8 public constant MAX_PLAYERS = 2;

    struct Cell {
        address player;
        bool isCastle;
        uint256[MAX_PLAYERS] units;
    }
    Cell[3][3] public grid;

    mapping(uint8 => address) public idToAddress;
    mapping(address => uint8) public addressToId;

    uint8 public totalPlayers;

    enum GameStatus {
        NotStarted,
        Ongoing,
        Finished
    }
    GameStatus public gameStatus;

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
    bool[MAX_PLAYERS] public roundSubmitted;
    Move[MAX_PLAYERS] public pendingMoves;

    uint256 public roundNumber;
    address public winner;

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

    modifier onlyNotStarted() {
        require(gameStatus == GameStatus.NotStarted, "Game already started");
        _;
    }

    modifier onlyOngoing() {
        require(gameStatus == GameStatus.Ongoing, "Game is not active");
        _;
    }

    modifier onlyPlayer() {
        require(
            addressToId[msg.sender] < totalPlayers,
            "Not a registered player"
        );
        _;
    }

    function addPlayer() external onlyNotStarted {
        require(totalPlayers < MAX_PLAYERS, "Max players reached");
        require(
            addressToId[msg.sender] == 0 &&
                (totalPlayers == 0 || idToAddress[0] != msg.sender),
            "Player already added"
        );

        // Assign player ID
        uint8 playerId = totalPlayers;
        idToAddress[playerId] = msg.sender;
        addressToId[msg.sender] = playerId;

        emit PlayerAdded(msg.sender, playerId);
        totalPlayers++;

        if (totalPlayers == MAX_PLAYERS) {
            _startGame();
        }
    }

    function _startGame() internal onlyNotStarted {
        gameStatus = GameStatus.Ongoing;

        grid[0][0].isCastle = true;
        grid[0][2].isCastle = true;
        grid[1][1].isCastle = true;
        grid[2][0].isCastle = true;
        grid[2][2].isCastle = true;

        grid[0][1].player = idToAddress[0];
        grid[0][1].units[0] = 10;
        grid[0][1].isCastle = false;

        grid[1][0].player = idToAddress[1];
        grid[1][0].units[1] = 10;
        grid[1][0].isCastle = false;

        emit GameStarted();
    }

    function _finalizeGame(address _winner) internal onlyOngoing {
        gameStatus = GameStatus.Finished;
        winner = _winner;
        // Handle payouts if necessary
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

        bool tie = true;

        for (uint8 i = 0; i < totalPlayers; i++) {
            if (totalUnits[i] > 2) {
                tie = false;
                break;
            }
        }

        if (tie) {
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

    function makeMove(Move memory _move) public onlyOngoing {
        require(
            !roundSubmitted[addressToId[msg.sender]],
            "Already submitted move"
        );
        require(_move.player == msg.sender, "Invalid move (address)");
        require(checkValidMove(_move), "Invalid move");

        (uint8 fromX, uint8 fromY) = (_move.fromX, _move.fromY);

        Cell storage fromCell = grid[fromX][fromY];
        require(fromCell.player == msg.sender, "Invalid move");

        pendingMoves[addressToId[msg.sender]] = _move;
        roundSubmitted[addressToId[msg.sender]] = true;

        if (_allMovesSubmitted()) {
            executeRound();
            emit RoundCompleted(roundNumber);
        }
    }

    function makeLoan(Loan memory _loan) public onlyOngoing {}

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

    function executeRound() public onlyOngoing {
        _handlePendingMoves();
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
                    // hacky way of getting winner - loser (in case of 2 players)
                    cell.units[winnerId] = 2 * winnerUnits - totalUnits;
                    cell.player = idToAddress[winnerId];
                }
            }
        }
        roundNumber++;
        delete roundSubmitted;
        _checkGameStatus();
    }

    function getGrid() public view returns (Cell[9] memory cells) {
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                cells[3 * i + j] = grid[i][j];
            }
        }
    }

    function get2dGrid() public view returns (Cell[3][3] memory cells) {
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                cells[i][j] = grid[i][j];
            }
        }
    }

    function checkValidMove(Move memory _move) public view returns (bool) {
        if (
            _move.fromX >= 3 ||
            _move.fromY >= 3 ||
            _move.toX >= 3 ||
            _move.toY >= 3
        ) {
            return false;
        }

        if (!_isAdjacent(_move.fromX, _move.fromY, _move.toX, _move.toY)) {
            return false;
        }

        Cell storage fromCell = grid[_move.fromX][_move.fromY];
        if (fromCell.units[addressToId[_move.player]] >= _move.units) {
            return true;
        }

        return false;
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

// IERC20...

// function resolveMove(fromX, fromY, toX, toY, units) {
//     // check if player occupies cell
//     // check if player has sufficient units
//     // check if to cell is adjacent
//     // logic to move units
//    // call internal function
// }

// function commitMove(bytes ciphertext) {
//
// }

// function revealMove() {}

// internal function to resolve conflicts
