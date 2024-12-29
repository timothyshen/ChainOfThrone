// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Game.sol";
import "./interfaces/IGame.sol";
import "./interfaces/IUSDC.sol";

contract GameFactory {
    event GameCreated(address indexed gameAddress, address indexed creator);

    // Array to keep track of all created games
    address[] public games;

    // Mapping to check if an address is a game created by this factory
    mapping(address => bool) public isGame;

    // Mapping to track games created by specific addresses
    mapping(address => address[]) public gamesByCreator;

    // Add USDC address as immutable
    IUSDC public immutable usdc;

    // Add constructor to set USDC address
    constructor(address _usdcAddress) {
        usdc = IUSDC(_usdcAddress);
    }

    function createGame() external returns (address) {
        Game game = new Game(address(usdc));
        address gameAddress = address(game);

        games.push(gameAddress);
        isGame[gameAddress] = true;
        gamesByCreator[msg.sender].push(gameAddress);

        // Creator must stake when creating game
        game.stake();

        emit GameCreated(gameAddress, msg.sender);

        return gameAddress;
    }

    function getGames() external view returns (address[] memory) {
        return games;
    }

    function getGamesByCreator(
        address creator
    ) external view returns (address[] memory) {
        return gamesByCreator[creator];
    }

    function getGamesCount() external view returns (uint256) {
        return games.length;
    }

    function getGamesByCreatorCount(
        address creator
    ) external view returns (uint256) {
        return gamesByCreator[creator].length;
    }
}
