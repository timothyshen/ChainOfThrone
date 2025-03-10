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
      chainId: 1337,
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
