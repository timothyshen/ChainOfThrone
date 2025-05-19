// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;


import "./Game.sol";
import {IGame} from "./interfaces/IGame.sol";

contract GameFactory {
    event GameCreated(address indexed gameAddress, address indexed creator);

    // Array to keep track of all created games
    address[] public games;

    // Mapping to check if an address is a game created by this factory
    mapping(address => bool) public isGame;

    // Mapping to track games created by specific addresses
    mapping(address => address[]) public gamesByCreator;

    struct GameInfo {
        address gameAddress;
        IGame.GameStatus status;
        uint8 totalPlayers;
        uint8 maxPlayers;
        uint256 roundNumber;
    }

    function createGame() external returns (address) {
        Game game = new Game(msg.sender);
        address gameAddress = address(game);

        games.push(gameAddress);
        isGame[gameAddress] = true;
        gamesByCreator[msg.sender].push(gameAddress);

        emit GameCreated(gameAddress, msg.sender);

        return gameAddress;
    }

    function getGames() external view returns (address[] memory) {
        return games;
    }

    function getGamesCount() external view returns (uint256) {
        return games.length;
    }

    function getGamesInfo() external view returns (GameInfo[] memory) {
        uint256 length = games.length;
        GameInfo[] memory infos = new GameInfo[](length);

        for (uint256 i = 0; i < length; i++) {
            address gameAddress = games[i];
            IGame game = IGame(gameAddress);

            infos[i] = GameInfo({
                gameAddress: gameAddress,
                status: game.gameStatus(),
                totalPlayers: game.totalPlayers(),
                maxPlayers: game.MAX_PLAYERS(),
                roundNumber: game.roundNumber()
            });
        }

        return infos;
    }
}
