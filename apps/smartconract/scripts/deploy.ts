import { ethers } from "hardhat";
import { network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const lock = await ethers.deployContract("MyNFT");

  // Or use this for older versions
  await lock.deployed();

  console.log(`MyNFT deployed to ${lock.address}`);

  const contractAddressPath = path.join(
    __dirname,
    "../../../packages/smart-contract-config/contract-addresses.json",
  );

  // Read existing addresses if file exists
  let existingAddresses = {};
  if (fs.existsSync(contractAddressPath)) {
    try {
      existingAddresses = JSON.parse(
        fs.readFileSync(contractAddressPath, "utf8"),
      );
    } catch (e) {
      console.log("Could not parse existing contract addresses file");
    }
  }

  // Only update if address changed
  const newAddresses = {
    ...existingAddresses,
    [network.name]: {
      MyNFT: lock.address,
    },
  };

  // Only write if content actually changed
  if (JSON.stringify(existingAddresses) !== JSON.stringify(newAddresses)) {
    fs.writeFileSync(
      contractAddressPath,
      JSON.stringify(newAddresses, null, 2),
    );
    console.log("Updated contract addresses file");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
