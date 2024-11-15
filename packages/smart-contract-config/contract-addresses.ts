import { networkList } from "./network-list";
import { MyNFT__factory } from "./typechain";
import fs from "fs";

type NetworkAddresses = {
  [key: string]: {
    [key: string]: string;
  };
};

type ContractAddresses = {
  [key: string]: NetworkAddresses;
};

// example of contractAddresses should look like this
const contractAddresses: ContractAddresses = {
  MyNFT: {
    [networkList.mainnet.id]: {
      xxx: "0x...",
    }, // Replace with actual mainnet address
    [networkList.sepolia.id]: {
      xxx: "0x...",
    }, // Replace with actual Sepolia address
    [networkList.base.id]: {
      myNFT: "0x0De804322516e288522C97A5e579bd84e6dA6E34",
    }, // Replace with actual Base address
    [networkList.arbitrumSepolia.id]: {
      xxx: "0x...",
    }, // Replace with actual Arbitrum Sepolia address
    [networkList.storyIliad.id]: {
      xxx: "0x...",
    }, // Replace with actual StoryIliad address
  },
};

export const getContractConstance = (networkId: string) => {
  // get all the file names from typechain folder
  const files = fs.readdirSync("./typechain");
  console.log(files);
  //remove index.ts, folder, hardhat.d.ts, common.ts
  const contractNames = files.filter(
    (file) =>
      !["index.ts", "folder", "hardhat.d.ts", "common.ts"].includes(file),
  );
  console.log(contractNames);
};
