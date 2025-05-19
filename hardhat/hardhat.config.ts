import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
// import "@nomicfoundation/hardhat-verify";
import { vars } from "hardhat/config";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: [
        {
          privateKey:
            "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
          balance: "1000000000000000000000000",
        },
      ],
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
    monadTestnet: {
      url: vars.get("MONAD_RPC_URL"),
      accounts: [vars.get("PRIVATE_KEY")],
      chainId: Number(vars.get("MONAD_CHAIN_ID")),
    },
    monad: {
      url: "https://testnet-rpc.monad.xyz/",
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com",
  },
  etherscan: {
    enabled: false,
    // apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
