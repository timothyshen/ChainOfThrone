export const gameAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
    ],
    name: "GameFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "GameStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "playerId",
        type: "uint8",
      },
    ],
    name: "PlayerAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "RoundExecuted",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_PLAYERS",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "addPlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "addressToId",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "lender",
            type: "address",
          },
          {
            internalType: "address",
            name: "borrower",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fromX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "fromY",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toY",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "units",
            type: "uint256",
          },
        ],
        internalType: "struct Game.Loan",
        name: "_loan",
        type: "tuple",
      },
    ],
    name: "checkValidLoan",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fromX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "fromY",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toY",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "units",
            type: "uint256",
          },
        ],
        internalType: "struct Game.Move",
        name: "_move",
        type: "tuple",
      },
    ],
    name: "checkValidMove",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentListPlayer",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executeRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gameStatus",
    outputs: [
      {
        internalType: "enum Game.GameStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get2dGrid",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "player",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "fromX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "fromY",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toY",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "units",
                type: "uint256",
              },
            ],
            internalType: "struct Game.Move[]",
            name: "pendingMoves",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "lender",
                type: "address",
              },
              {
                internalType: "address",
                name: "borrower",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "fromX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "fromY",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toY",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "units",
                type: "uint256",
              },
            ],
            internalType: "struct Game.Loan[]",
            name: "pendingLoans",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "units",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isCastle",
            type: "bool",
          },
        ],
        internalType: "struct Game.Cell[3][3]",
        name: "cells",
        type: "tuple[3][3]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGrid",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "player",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "fromX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "fromY",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toY",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "units",
                type: "uint256",
              },
            ],
            internalType: "struct Game.Move[]",
            name: "pendingMoves",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "lender",
                type: "address",
              },
              {
                internalType: "address",
                name: "borrower",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "fromX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "fromY",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toX",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "toY",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "units",
                type: "uint256",
              },
            ],
            internalType: "struct Game.Loan[]",
            name: "pendingLoans",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "units",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isCastle",
            type: "bool",
          },
        ],
        internalType: "struct Game.Cell[9]",
        name: "cells",
        type: "tuple[9]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "grid",
    outputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "units",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isCastle",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    name: "idToAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "lender",
            type: "address",
          },
          {
            internalType: "address",
            name: "borrower",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fromX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "fromY",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toY",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "units",
            type: "uint256",
          },
        ],
        internalType: "struct Game.Loan",
        name: "_loan",
        type: "tuple",
      },
    ],
    name: "makeLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fromX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "fromY",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toX",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "toY",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "units",
            type: "uint256",
          },
        ],
        internalType: "struct Game.Move",
        name: "_move",
        type: "tuple",
      },
    ],
    name: "makeMove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "roundNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPlayers",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
