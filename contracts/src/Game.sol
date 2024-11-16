// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Factory contract for game

contract Game {
    uint8 public constant MAX_PLAYERS = 2;

    struct Cell {
        Move[] pendingMoves;
        Loan[] pendingLoans;
        address player;
        uint256 units;
        bool isCastle;
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
    bool[MAX_PLAYERS] roundSubmitted;

    uint256 public roundNumber;

    event GameStarted();
    event GameFinalized(address indexed winner);
    event PlayerAdded(address indexed player, uint8 playerId);

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

        // handle USDC ??
    }

    function _startGame() internal onlyNotStarted {
        gameStatus = GameStatus.Ongoing;

        grid[0][0].isCastle = true;
        grid[0][2].isCastle = true;
        grid[1][1].isCastle = true;
        grid[2][0].isCastle = true;
        grid[2][2].isCastle = true;

        grid[0][1].player = idToAddress[0];
        grid[0][1].units = 10;
        grid[0][1].isCastle = false;

        grid[1][0].player = idToAddress[1];
        grid[1][0].units = 10;
        grid[1][0].isCastle = false;

        if (MAX_PLAYERS == 3) {
            grid[1][2].player = idToAddress[2];
            grid[1][2].units = 10;
            grid[1][2].isCastle = false;
        }

        emit GameStarted();
    }

    function _finalizeGame(address winner) internal onlyOngoing {
        gameStatus = GameStatus.Finished;
        // Handle payouts if necessary
        emit GameFinalized(winner);
    }

    function _checkGameStatus() internal {
        uint8[] memory winnerCheck = new uint8[](totalPlayers);
        uint256[] memory unitCheck = new uint256[](totalPlayers);

        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                Cell memory cell = grid[i][j];
                if (cell.isCastle && cell.player != address(0)) {
                    winnerCheck[addressToId[cell.player]]++;
                    unitCheck[addressToId[cell.player]] += cell.units;
                }
            }
        }

        bool tie = true;
        for (uint8 i = 0; i < totalPlayers; i++) {
            if (unitCheck[i] > 2) {
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

        (uint8 fromX, uint8 fromY, uint8 toX, uint8 toY, ) = (
            _move.fromX,
            _move.fromY,
            _move.toX,
            _move.toY,
            _move.units
        );

        Cell storage fromCell = grid[fromX][fromY];
        require(fromCell.player == msg.sender, "Invalid move");

        fromCell.pendingMoves.push(_move);

        Cell storage toCell = grid[toX][toY];
        toCell.pendingMoves.push(_move);

        roundSubmitted[addressToId[msg.sender]] = true;

        if (_allMovesSubmitted()) {
            executeRound();
        }
    }

    function makeLoan(Loan memory _loan) public onlyOngoing {
        require(_loan.lender == msg.sender, "Invalid loan (address)");
        require(checkValidLoan(_loan), "Invalid loan");

        Cell storage toCell = grid[_loan.toX][_loan.toY];
        toCell.pendingLoans.push(_loan);
    }

    function _allMovesSubmitted() internal view returns (bool) {
        for (uint8 i = 0; i < totalPlayers; i++) {
            if (!roundSubmitted[i]) {
                return false;
            }
        }
        return true;
    }

    function executeRound() public onlyOngoing {
        // first move from current cell to new cell
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                Cell storage cell = grid[i][j];
                for (uint256 k = 0; k < cell.pendingMoves.length; k++) {
                    Move storage move = cell.pendingMoves[k];
                    // remove from unit first
                    if (move.fromX == i && move.fromY == j) {
                        Cell storage toCell = grid[move.toX][move.toY];
                        cell.units -= move.units;
                        for (uint256 l = 0; l < cell.pendingMoves.length; l++) {
                            if (cell.pendingMoves[i].player == move.player) {
                                cell.pendingMoves[i].units += move.units;
                            }
                        }
                        toCell.units += move.units;

                        if (cell.units == 0) {
                            cell.player = address(0);
                        }
                    }
                }

                // manage loans
                for (uint256 k = 0; k < cell.pendingLoans.length; k++) {
                    Loan storage loan = cell.pendingLoans[k];
                    // look for pending Move such that the loan borrower = pending move
                    for (uint256 l = 0; l < cell.pendingMoves.length; l++) {
                        if (loan.borrower == cell.pendingMoves[l].player) {
                            cell.pendingMoves[l].units += loan.units;
                            break;
                        }
                    }
                }

                address largestAddress = cell.player;
                uint256 largest = cell.units;
                uint256 secondLargest = 0;
                for (uint256 k = 0; k < cell.pendingMoves.length; k++) {
                    Move storage move = cell.pendingMoves[k];
                    if (move.toX == i && move.toY == j) {
                        if (move.units >= largest) {
                            secondLargest = largest;
                            largest = move.units;
                            largestAddress = move.player;
                        }
                    }
                }
                cell.units = largest - secondLargest;
                if (cell.units == 0) {
                    cell.player = address(0);
                } else {
                    cell.player = largestAddress;
                }
                delete cell.pendingMoves;
                delete cell.pendingLoans;
            }
        }
        // start new round
        roundNumber++;
        for (uint i = 0; i < MAX_PLAYERS; i++) {
            roundSubmitted[i] = false;
        }
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
        if (fromCell.units >= _move.units) {
            return true;
        }

        return false;
    }

    function checkValidLoan(Loan memory _loan) public view returns (bool) {
        if (
            _loan.fromX >= 3 ||
            _loan.fromY >= 3 ||
            _loan.toX >= 3 ||
            _loan.toY >= 3
        ) {
            return false;
        }

        if (!_isAdjacent(_loan.fromX, _loan.fromY, _loan.toX, _loan.toY)) {
            return false;
        }

        Cell storage fromCell = grid[_loan.fromX][_loan.fromY];
        if (fromCell.player == msg.sender && fromCell.units >= _loan.units) {
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
