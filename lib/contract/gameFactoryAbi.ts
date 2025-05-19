export const gameFactoryAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_vault",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "GameFinalized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "GameStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "fromX",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "fromY",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "toX",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "toY",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "units",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        }
      ],
      "name": "MoveRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "fromX",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "fromY",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "toX",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "toY",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "units",
          "type": "uint256"
        }
      ],
      "name": "MoveSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "playerId",
          "type": "uint8"
        }
      ],
      "name": "PlayerAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "RewardClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        }
      ],
      "name": "RoundCompleted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_PLAYERS",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PROTOCOL_PERCENTAGE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "STAKE_AMOUNT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "WINNER_PERCENTAGE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addPlayer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "addressToId",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameStatus",
      "outputs": [
        {
          "internalType": "enum Game.GameStatus",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get2dGrid",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "player",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isCastle",
              "type": "bool"
            },
            {
              "internalType": "uint256[2]",
              "name": "units",
              "type": "uint256[2]"
            }
          ],
          "internalType": "struct Game.Cell[3][3]",
          "name": "cells",
          "type": "tuple[3][3]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGrid",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "player",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isCastle",
              "type": "bool"
            },
            {
              "internalType": "uint256[2]",
              "name": "units",
              "type": "uint256[2]"
            }
          ],
          "internalType": "struct Game.Cell[9]",
          "name": "cells",
          "type": "tuple[9]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMoveHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "player",
              "type": "address"
            },
            {
              "internalType": "uint8",
              "name": "fromX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "fromY",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toY",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "units",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "roundNumber",
              "type": "uint256"
            }
          ],
          "internalType": "struct Game.MoveHistory[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerMoves",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "player",
              "type": "address"
            },
            {
              "internalType": "uint8",
              "name": "fromX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "fromY",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toY",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "units",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "roundNumber",
              "type": "uint256"
            }
          ],
          "internalType": "struct Game.MoveHistory[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProtocolFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "round",
          "type": "uint256"
        }
      ],
      "name": "getRoundMoves",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "player",
              "type": "address"
            },
            {
              "internalType": "uint8",
              "name": "fromX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "fromY",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toY",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "units",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "roundNumber",
              "type": "uint256"
            }
          ],
          "internalType": "struct Game.MoveHistory[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getWinner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getWinnerAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "grid",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isCastle",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "idToAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "player",
              "type": "address"
            },
            {
              "internalType": "uint8",
              "name": "fromX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "fromY",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toX",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "toY",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "units",
              "type": "uint256"
            }
          ],
          "internalType": "struct Game.Move",
          "name": "_move",
          "type": "tuple"
        }
      ],
      "name": "makeMove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "moveHistory",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "fromX",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "fromY",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "toX",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "toY",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "units",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "pendingMoves",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "fromX",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "fromY",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "toX",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "toY",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "units",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "roundNumber",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "roundSubmitted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalPlayers",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "vault",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "winner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]